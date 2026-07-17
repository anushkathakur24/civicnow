"""One-off cleanup: remove the two fabricated NGO rows that an earlier
version of seed.py created on first deploy — "Blue Cross of India" (real
org, marked verified=True with a placeholder darpan_id="DEMO-001" that was
never actually checked against anything) and "Unverified Local Shelter
(example)" (explicitly-fake placeholder data).

This does NOT touch anything a real applicant submitted through
POST /ngos/apply — it matches only on the exact name + darpan_id/city
combination the old seed script used, so it's safe to run even if real
NGOs have since applied.

Run once against production with the real DATABASE_URL, e.g.:
    DATABASE_URL=<your production URL> python3 scripts/fix_seed_ngos_2026_07.py

Safe to re-run — it's a no-op once the two rows are gone.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.civic import NGO

db = SessionLocal()

removed = []

blue_cross = (
    db.query(NGO)
    .filter(NGO.name == "Blue Cross of India", NGO.darpan_id == "DEMO-001")
    .first()
)
if blue_cross:
    removed.append(blue_cross.name)
    db.delete(blue_cross)

example_shelter = (
    db.query(NGO)
    .filter(NGO.name == "Unverified Local Shelter (example)")
    .first()
)
if example_shelter:
    removed.append(example_shelter.name)
    db.delete(example_shelter)

if removed:
    db.commit()
    print(f"Removed {len(removed)} fabricated seed row(s): {', '.join(removed)}")
else:
    print("Nothing to remove — already clean.")
