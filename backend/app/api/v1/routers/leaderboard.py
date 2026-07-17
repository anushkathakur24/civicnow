from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.models.user import User
from app.models.civic import ActionSubmission

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# NOTE: computed on-demand here for correctness at prototype scale. In production,
# this must be served from the `user_scores` materialized view refreshed on a
# cron (see Production Architecture Part 2/4) — never aggregate live per-request
# once submissions are in the hundreds of thousands.


@router.get("")
def leaderboard(
    scope: str = Query("global", pattern="^(global|city|college|company)$"),
    scope_value: str | None = None,
    limit: int = Query(50, le=200),
    db: DBSession = Depends(get_db),
):
    q = (
        db.query(
            User.id,
            User.username,
            User.display_name,
            User.city,
            User.show_real_name_public,
            func.coalesce(func.sum(ActionSubmission.points_awarded), 0).label("score"),
        )
        .outerjoin(ActionSubmission, ActionSubmission.user_id == User.id)
        .filter(User.leaderboard_opt_in.is_(True))  # opt-in only — see Part 4 privacy note
        .group_by(User.id)
    )
    if scope == "city" and scope_value:
        q = q.filter(User.city == scope_value)
    elif scope == "college" and scope_value:
        q = q.filter(User.college == scope_value)
    elif scope == "company" and scope_value:
        q = q.filter(User.company == scope_value)
    rows = q.order_by(func.sum(ActionSubmission.points_awarded).desc()).limit(limit).all()
    results = []
    for i, r in enumerate(rows):
        # `leaderboard_opt_in` controls whether you appear at all; `show_real_name_public`
        # (changeable anytime from the profile page) controls whether you appear under
        # your real name/username or a stable, non-identifying pseudonym. Default is
        # anonymous — opting in doesn't force you to also be named.
        if r.show_real_name_public:
            username, display_name = r.username, r.display_name
        else:
            username, display_name = None, f"Anonymous Citizen {r.id[:6].upper()}"
        results.append({
            "rank": i + 1,
            "username": username,
            "display_name": display_name,
            "city": r.city,
            "score": int(r.score),
        })
    return results
