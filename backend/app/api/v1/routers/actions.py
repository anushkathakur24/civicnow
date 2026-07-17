import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.civic import ActionDefinition, ActionSubmission
from app.models.user import User
from app.schemas.action import ActionSubmitRequest, ActionSubmissionOut, ScoreBreakdown
from app.services.scoring import compute_points, get_score_breakdown

router = APIRouter(prefix="/actions", tags=["actions"])
logger = logging.getLogger("civicnow.actions")


@router.post("/submit", response_model=ActionSubmissionOut, status_code=201)
def submit_action(
    payload: ActionSubmitRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    action = db.get(ActionDefinition, payload.action_definition_id)
    if not action:
        raise HTTPException(404, "Action not found")

    # Idempotency: a retried request (flaky network, double-tap) must never
    # create a second row / award duplicate points. See Production Architecture
    # Part 12 — this was flagged as the single most likely real-world exploit.
    existing = (
        db.query(ActionSubmission)
        .filter(
            ActionSubmission.user_id == current_user.id,
            ActionSubmission.idempotency_key == payload.idempotency_key,
        )
        .first()
    )
    if existing:
        return existing

    # Auto-approve only the lowest-trust, self-reported tier; everything else
    # sits in `pending` until a moderator/NGO/government verifier confirms it.
    if action.verification_method == "self_reported" and current_user.can_earn_points:
        state = "auto_approved"
    else:
        state = "pending"

    points, trust = compute_points(db, current_user.id, action, state) if current_user.can_earn_points else (0, 0.0)

    submission = ActionSubmission(
        user_id=current_user.id,
        action_definition_id=action.id,
        idempotency_key=payload.idempotency_key,
        verification_state=state,
        trust_multiplier=trust,
        points_awarded=points,
        evidence_url=payload.evidence_url,
        reference_number=payload.reference_number,
        ip_submitted=request.client.host if request.client else None,
    )
    db.add(submission)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(ActionSubmission)
            .filter(ActionSubmission.user_id == current_user.id, ActionSubmission.idempotency_key == payload.idempotency_key)
            .first()
        )
        if existing:
            return existing
        raise HTTPException(status.HTTP_409_CONFLICT, "Duplicate submission")
    db.refresh(submission)
    logger.info("action_submitted", extra={"user_id": current_user.id, "action_id": action.id, "state": state})
    return submission


@router.get("/me", response_model=list[ActionSubmissionOut])
def my_submissions(current_user: User = Depends(get_current_user), db: DBSession = Depends(get_db)):
    return (
        db.query(ActionSubmission)
        .filter(ActionSubmission.user_id == current_user.id)
        .order_by(ActionSubmission.submitted_at.desc())
        .all()
    )


@router.get("/me/score", response_model=ScoreBreakdown)
def my_score(current_user: User = Depends(get_current_user), db: DBSession = Depends(get_db)):
    breakdown = get_score_breakdown(db, current_user.id)
    breakdown["current_streak"] = current_user.streak.current_streak if current_user.streak else 0
    return breakdown


@router.post("/{submission_id}/verify", response_model=ActionSubmissionOut)
def verify_submission(
    submission_id: str,
    approve: bool,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role not in ("moderator", "editorial_lead", "ngo_staff", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Verification requires moderator/NGO/admin role")
    submission = db.get(ActionSubmission, submission_id)
    if not submission:
        raise HTTPException(404, "Submission not found")
    action = db.get(ActionDefinition, submission.action_definition_id)
    submission.verification_state = "verified" if approve else "rejected"
    submission.reviewer_id = current_user.id
    from datetime import datetime, timezone
    submission.reviewed_at = datetime.now(timezone.utc)
    if approve:
        points, trust = compute_points(db, submission.user_id, action, "verified")
        submission.points_awarded = points
        submission.trust_multiplier = trust
    else:
        submission.points_awarded = 0
    db.commit()
    db.refresh(submission)
    return submission
