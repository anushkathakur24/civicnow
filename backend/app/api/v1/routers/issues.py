from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession, selectinload

from app.db.session import get_db
from app.models.civic import Issue, ActionDefinition
from app.models.system import AuditLog
from app.schemas.issue import IssueSummary, IssueDetail, ActionDefinitionOut
from app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("", response_model=list[IssueSummary])
def list_issues(
    db: DBSession = Depends(get_db),
    limit: int = Query(20, le=100),
    cursor: str | None = None,  # cursor = last-seen issue id; keeps pagination stable at scale
):
    q = db.query(Issue).filter(Issue.published.is_(True)).order_by(Issue.id)
    if cursor:
        q = q.filter(Issue.id > cursor)
    return q.limit(limit).all()


@router.get("/{issue_id}", response_model=IssueDetail)
def get_issue(issue_id: str, db: DBSession = Depends(get_db)):
    issue = (
        db.query(Issue)
        .options(
            selectinload(Issue.timeline),
            selectinload(Issue.promises),
            selectinload(Issue.sources),
            selectinload(Issue.responsible_bodies),
        )
        .filter(Issue.id == issue_id, Issue.published.is_(True))
        .first()
    )
    if not issue:
        raise HTTPException(404, "Issue not found")
    return IssueDetail.model_validate(issue)


@router.get("/{issue_id}/history", response_model=list[AuditLogOut])
def get_issue_history(issue_id: str, db: DBSession = Depends(get_db)):
    """Real, immutable version history for an issue — every row here is a
    genuine content-authoring event (see app/services/audit.py), never a
    fabricated 'reviewed'/'approved' step. Empty list means no history has
    been recorded yet for this issue, not that nothing has changed."""
    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.published.is_(True)).first()
    if not issue:
        raise HTTPException(404, "Issue not found")
    return (
        db.query(AuditLog)
        .filter(AuditLog.target_type == "issue", AuditLog.target_id == issue_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


@router.get("/{issue_id}/actions", response_model=list[ActionDefinitionOut])
def get_issue_actions(issue_id: str, persona: str = Query(...), db: DBSession = Depends(get_db)):
    actions = (
        db.query(ActionDefinition)
        .filter(ActionDefinition.issue_id == issue_id, ActionDefinition.persona_id == persona)
        .all()
    )
    return actions
