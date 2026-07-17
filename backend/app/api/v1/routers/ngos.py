from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.models.civic import NGO

router = APIRouter(prefix="/ngos", tags=["ngos"])


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
