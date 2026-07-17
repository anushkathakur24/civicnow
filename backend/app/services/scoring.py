"""Server-side scoring — the entire point of this service is that a client can
never set its own score. Every number here is computed from verified rows in
`action_submissions`. See CivicNow_Production_Architecture.md Parts 3-4.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from app.models.civic import ActionSubmission, ActionDefinition

TRUST_MULTIPLIERS = {
    "self_reported": 0.2,
    "receipt_upload": 0.7,
    "ngo_confirmation": 1.0,
    "document_upload": 0.8,
    "reference_number": 0.8,
    "social_post_verification": 0.5,
    "qr_attendance": 1.0,
    "moderator_approval": 0.6,
    "government_official_verification": 1.0,
}

IMPACT_BASE_POINTS = {"high": 50, "medium": 30, "low": 15}

TIER_THRESHOLDS = [
    (300, "Civic Champion"),
    (150, "Changemaker"),
    (50, "Contributor"),
    (0, "Getting Started"),
]


def tier_for(score: int) -> str:
    for threshold, label in TIER_THRESHOLDS:
        if score >= threshold:
            return label
    return "Getting Started"


def diminishing_returns_multiplier(db: DBSession, user_id: str, category: str) -> float:
    """3rd+ identical-category action in a rolling 7-day window counts at 10%.
    This — not the trust multiplier alone — is what actually kills spam farming
    of the cheapest action type (e.g. repeatedly submitting 'awareness' shares)."""
    window_start = datetime.now(timezone.utc) - timedelta(days=7)
    count = (
        db.query(func.count(ActionSubmission.id))
        .join(ActionDefinition, ActionSubmission.action_definition_id == ActionDefinition.id)
        .filter(
            ActionSubmission.user_id == user_id,
            ActionDefinition.category == category,
            ActionSubmission.submitted_at >= window_start,
            ActionSubmission.verification_state.in_(["verified", "auto_approved"]),
        )
        .scalar()
    ) or 0
    return 1.0 if count < 3 else 0.1


def compute_points(db: DBSession, user_id: str, action: ActionDefinition, verification_state: str) -> tuple[int, float]:
    """Returns (points_awarded, trust_multiplier_used)."""
    base = IMPACT_BASE_POINTS.get(action.impact, 15)
    trust = TRUST_MULTIPLIERS.get(action.verification_method, 0.2)
    if verification_state not in ("verified", "auto_approved"):
        return 0, trust  # nothing awarded until verified
    diminishing = diminishing_returns_multiplier(db, user_id, action.category)
    points = round(base * trust * diminishing)
    return points, trust


def get_score_breakdown(db: DBSession, user_id: str) -> dict:
    rows = (
        db.query(ActionSubmission, ActionDefinition)
        .join(ActionDefinition, ActionSubmission.action_definition_id == ActionDefinition.id)
        .filter(
            ActionSubmission.user_id == user_id,
            ActionSubmission.verification_state.in_(["verified", "auto_approved"]),
        )
        .all()
    )
    total = 0
    issues = set()
    counts = {"rti_grievance": 0, "volunteering": 0, "awareness": 0, "donation": 0, "advocacy": 0}
    for submission, action in rows:
        total += submission.points_awarded
        issues.add(action.issue_id)
        if action.category in counts:
            counts[action.category] += 1
    return {
        "impact_score": total,
        "tier": tier_for(total),
        "issues_supported": len(issues),
        "rti_grievance_count": counts["rti_grievance"],
        "volunteering_count": counts["volunteering"],
        "awareness_count": counts["awareness"],
        "donation_count": counts["donation"],
        "advocacy_count": counts["advocacy"],
    }
