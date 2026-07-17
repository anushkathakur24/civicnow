from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.models.civic import NGO
from app.schemas.ngo import NGOApplyIn

router = APIRouter(prefix="/ngos", tags=["ngos"])
# Rate limiting: inherited from the app-wide default_limits set on
# app.state.limiter in main.py — no per-route decorator needed here.


@router.get("")
def list_ngos(
    verified_only: bool = Query(False),
    city: str | None = None,
    db: DBSession = Depends(get_db),
):
    q = db.query(NGO)
    if verified_only:
        q = q.filter(NGO.verified.is_(True))
    if city:
        q = q.filter(NGO.city == city)
    return q.all()


@router.get("/{ngo_id}")
def get_ngo(ngo_id: str, db: DBSession = Depends(get_db)):
    ngo = db.get(NGO, ngo_id)
    if not ngo:
        raise HTTPException(404, "NGO not found")
    return ngo


@router.post("/apply", status_code=201)
def apply_ngo(payload: NGOApplyIn, db: DBSession = Depends(get_db)):
    """Public, unauthenticated: an NGO applying to be listed. This creates a
    real row immediately (`verified=False`), which is exactly what the
    existing NGO directory already knows how to render honestly (an
    "Unverified" chip + the disclosure that registration hasn't been
    confirmed) — no separate admin queue needed for a v1. Verification
    (checking the Darpan ID) is a manual follow-up via `contact_email`,
    never automatic."""
    ngo = NGO(
        name=payload.name,
        contact_email=payload.contact_email,
        city=payload.city,
        website=payload.website,
        darpan_id=payload.darpan_id,
        focus_areas=payload.focus_areas,
        application_message=payload.message,
        verified=False,
    )
    db.add(ngo)
    db.commit()
    db.refresh(ngo)
    return {"id": ngo.id, "status": "received"}
