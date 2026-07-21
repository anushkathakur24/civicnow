"""One-off backfill: add a second, distinct Change.org petition to the
NEET-UG issue's "Sign and Share the Petition(s)" HelpAction.

The existing petition (SRC_PETITION_FIRE) calls for Education Minister
Dharmendra Pradhan's resignation. The new one, "Government of India: Please
Talk to Mr. Sonam Wangchuk" (created July 15, 2026, verified live via fetch
on July 22 at 472,747 signatures), makes a different ask: dialogue with
Wangchuk given his health, not the minister's resignation. Since the asks
differ, this folds the new URL into the existing petition action (renamed
plural: "Petitions") with an updated description covering both, rather than
inventing a second nearly-identical HelpAction card.

Why a script and not just re-running seed.py: production already has this
issue seeded, and scripts/seed.py exits immediately once any Issue row
exists. Same pattern as the prior NEET-UG backfills.

What this does, idempotent (safe to re-run):
  - Finds the HelpAction by issue_id + action_type="petition" + the OLD
    title "Sign and Share the Petition" (singular) and updates it in place
    (title, description, source_urls, last_verified). If a second run finds
    the title already renamed to the plural, it correctly does nothing
    rather than creating a duplicate.

Run once against production with the real DATABASE_URL, e.g.:
    DATABASE_URL=<your production URL> python3 scripts/backfill_wangchuk_dialogue_petition_2026_07_22.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
from app.db.session import SessionLocal
from app.models.civic import HelpAction

db = SessionLocal()

ISSUE_ID = "neet-2026-leak"

SRC_PETITION_FIRE = "https://www.change.org/p/fire-education-minister-of-india-mr-dharmendra-pradhan"
SRC_PETITION_DIALOGUE = "https://www.change.org/p/government-of-india-please-talk-to-mr-sonam-wangchuk"

petition = (
    db.query(HelpAction)
    .filter(HelpAction.issue_id == ISSUE_ID, HelpAction.action_type == "petition", HelpAction.title == "Sign and Share the Petition")
    .first()
)
if petition:
    petition.title = "Sign and Share the Petitions"
    petition.description = (
        "Two active Change.org petitions are circulating: one calling for Education Minister "
        "Dharmendra Pradhan's resignation, another (472,000+ signatures as of July 22) urging the "
        "government to open dialogue with Wangchuk given his deteriorating health. Check the live "
        "signature counts and add yours at the links below."
    )
    petition.source_urls = [SRC_PETITION_FIRE, SRC_PETITION_DIALOGUE]
    petition.last_verified = date(2026, 7, 22)
    updated = True
else:
    updated = False

db.commit()
print(
    f"Backfill complete for '{ISSUE_ID}': petition action {'updated' if updated else 'NOT FOUND (already renamed, or seed not run)'}"
)
