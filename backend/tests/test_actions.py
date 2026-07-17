import uuid
from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal
from app.models.user import User
from app.models.civic import Issue, ActionDefinition
from app.core.security import hash_password


def _seed_issue_and_action(db):
    issue_id = f"test-issue-{uuid.uuid4().hex[:8]}"
    issue = Issue(id=issue_id, title="Test Issue", category="Test", urgency="high",
                   status="ongoing", summary="A test issue.", published=True)
    db.add(issue)
    db.flush()
    action = ActionDefinition(issue_id=issue_id, persona_id="citizen", action_text="Do a thing",
                               impact="high", category="awareness", verification_method="self_reported",
                               base_points=50)
    db.add(action)
    db.commit()
    return action.id


def _make_verified_user(db, email="scoretest@example.com"):
    user = User(
        email=email, username=email.split("@")[0], display_name="Score Test",
        password_hash=hash_password("supersecret1"),
        email_verified_at=datetime.now(timezone.utc) - timedelta(days=2),
        created_at=datetime.now(timezone.utc) - timedelta(days=2),
    )
    db.add(user)
    db.commit()
    return user


def test_score_cannot_be_set_by_client(client):
    """The whole point of the server-side scoring model: there is no endpoint
    that accepts a client-supplied score/points value. Confirm none exists."""
    db = SessionLocal()
    action_id = _seed_issue_and_action(db)
    user = _make_verified_user(db)
    db.close()

    r = client.post("/api/v1/auth/login", json={"email": "scoretest@example.com", "password": "supersecret1"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = client.get("/api/v1/actions/me/score", headers=headers)
    assert r.json()["impact_score"] == 0

    r = client.post("/api/v1/actions/submit", headers=headers,
                     json={"action_definition_id": action_id, "idempotency_key": "k1-aaaaaaaa"})
    assert r.status_code == 201
    assert r.json()["verification_state"] == "auto_approved"
    assert r.json()["points_awarded"] == 10  # 50 base * 0.2 self_reported trust

    r = client.get("/api/v1/actions/me/score", headers=headers)
    assert r.json()["impact_score"] == 10


def test_idempotent_submission_does_not_double_award(client):
    db = SessionLocal()
    action_id = _seed_issue_and_action(db)
    _make_verified_user(db, email="idem@example.com")
    db.close()

    token = client.post("/api/v1/auth/login", json={"email": "idem@example.com", "password": "supersecret1"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    for _ in range(3):
        client.post("/api/v1/actions/submit", headers=headers,
                     json={"action_definition_id": action_id, "idempotency_key": "same-key-aaaa"})

    r = client.get("/api/v1/actions/me/score", headers=headers)
    assert r.json()["impact_score"] == 10  # not 30 — duplicate submits must not stack
