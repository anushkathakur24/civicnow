from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    """Liveness probe — does the process respond at all."""
    return {"status": "ok"}


@router.get("/health/db")
def health_db(db: DBSession = Depends(get_db)):
    """Readiness probe — can we actually reach the database."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "reachable"}
