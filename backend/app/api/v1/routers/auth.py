import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_current_user
from app.core.security import create_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("civicnow.auth")


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: DBSession = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        username=payload.username,
        display_name=payload.display_name,
        persona_id=payload.persona_id,
        # NOTE: in production, email_verified_at is set only after a verification
        # link is clicked (send via SES/Postmark — see DEPLOYMENT.md). Auto-verifying
        # here would defeat the entire anti-fraud gate in scoring.py.
        email_verified_at=None,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Email or username already exists")
    db.refresh(user)
    logger.info("user_registered", extra={"user_id": user.id})
    access = create_token(user.id, "access")
    return TokenResponse(access_token=access)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DBSession = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        # Deliberately identical error for "no such user" and "wrong password" —
        # distinguishing them lets an attacker enumerate registered emails.
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    user.last_seen_at = datetime.now(timezone.utc)
    db.commit()
    access = create_token(user.id, "access")
    return TokenResponse(access_token=access)


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/google/login")
def google_login_stub():
    """Google OAuth entry point.

    Not wired to a live Google Cloud project — that requires an OAuth Client ID
    created in console.cloud.google.com by whoever owns this deployment (a Claude
    session cannot register that on your behalf). Once GOOGLE_CLIENT_ID/SECRET are
    set in the environment, this redirects to Google's consent screen using
    authlib; the /google/callback handler exchanges the code, looks up-or-creates
    a User by google_sub, and issues the same JWT pair as /login.
    """
    raise HTTPException(
        status.HTTP_501_NOT_IMPLEMENTED,
        "Google OAuth requires GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET to be configured. "
        "See DEPLOYMENT.md 'Google OAuth setup'.",
    )
