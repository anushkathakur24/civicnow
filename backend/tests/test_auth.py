def test_register_and_login(client):
    r = client.post("/api/v1/auth/register", json={
        "email": "test@example.com", "password": "supersecret1",
        "username": "test_user", "display_name": "Test User",
    })
    assert r.status_code == 201
    assert "access_token" in r.json()

    r = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "supersecret1"})
    assert r.status_code == 200
    token = r.json()["access_token"]

    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "test_user"


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wp@example.com", "password": "correctpass1",
        "username": "wp_user", "display_name": "WP",
    })
    r = client.post("/api/v1/auth/login", json={"email": "wp@example.com", "password": "wrongpass"})
    assert r.status_code == 401


def test_duplicate_email_rejected(client):
    body = {"email": "dup@example.com", "password": "supersecret1", "username": "dup1", "display_name": "D"}
    client.post("/api/v1/auth/register", json=body)
    body["username"] = "dup2"
    r = client.post("/api/v1/auth/register", json=body)
    assert r.status_code == 409


def test_protected_route_requires_auth(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_weak_password_rejected(client):
    r = client.post("/api/v1/auth/register", json={
        "email": "weak@example.com", "password": "short",
        "username": "weakuser", "display_name": "Weak",
    })
    assert r.status_code == 422
