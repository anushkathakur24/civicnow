from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserPublic
from app.schemas.action import ScoreBreakdown
from app.services.scoring import get_score_breakdown

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{username}", response_model=UserPublic)
def public_profile(username: str, db: DBSession = Depends(get_db)):
    user = db.query(User).filter(User.username == username, User.account_status == "active").first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.get("/{username}/score", response_model=ScoreBreakdown)
def public_score(username: str, db: DBSession = Depends(get_db)):
    user = db.query(User).filter(User.username == username, User.account_status == "active").first()
    if not user:
        raise HTTPException(404, "User not found")
    breakdown = get_score_breakdown(db, user.id)
    breakdown["current_streak"] = user.streak.current_streak if user.streak else 0
    return breakdown
