"""One-off backfill: bring existing production issue rows up to the new
"Standardize Support Notices & Sourced Action Lists" content schema.

Why this is needed separately from `alembic upgrade head` + `scripts/seed.py`:
the migration adds the new columns (`sensitive_content`, `support_note_visible`)
with safe defaults, but production already has the 3 issues seeded — and
`scripts/seed.py` exits immediately ("Already seeded — skipping.") once any
Issue row exists. So the migration alone leaves production with
`sensitive_content=False` everywhere and zero `help_actions` rows, which is
exactly the stale state visible in production right now (the old inline
amber crisis line on the NEET-UG page instead of the new SupportNotice
callout, and no sourced "How you can help" list).

This script:
  1. Updates the NEET-UG row: sensitive_content=True, support_note_visible=True,
     and shortens sensitive_note to just the contextual line (the actual
     helpline numbers now render from frontend/lib/supportResources.ts, not
     from this field).
  2. Confirms Ladakh and the stray-dog verdict stay sensitive_content=False
     (explicit, not just left at the default).
  3. Inserts the sourced HelpAction rows for all three issues — same content
     as scripts/seed.py, kept in sync with it. If you ever edit the
     help_actions content in seed.py, mirror the change here too, or future
     re-runs of this script will silently re-add the old copy.

Idempotent: matching is done by (issue_id, action_type, title), so re-running
this after it's already applied just updates in place rather than duplicating
rows.

Run once against production with the real DATABASE_URL, e.g.:
    DATABASE_URL=<your production URL> python3 scripts/backfill_support_and_help_actions_2026_07.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
from app.db.session import SessionLocal
from app.models.civic import Issue, HelpAction

db = SessionLocal()

# ---- 1. Sensitive-content flags on the 3 existing issue rows --------------

neet = db.query(Issue).filter(Issue.id == "neet-2026-leak").first()
if neet:
    neet.sensitive_content = True
    neet.support_note_visible = True
    neet.sensitive_note = "This issue involves student suicides and an active, health-critical hunger strike."

ladakh = db.query(Issue).filter(Issue.id == "ladakh-sixth-schedule").first()
if ladakh:
    ladakh.sensitive_content = False

strays = db.query(Issue).filter(Issue.id == "sc-stray-dog-verdict").first()
if strays:
    strays.sensitive_content = False

db.flush()

# ---- 2. Sourced help_actions, same content as scripts/seed.py -------------

SRC_CJP_MONTH = "https://www.aljazeera.com/news/2026/6/16/my-voice-is-being-heard-a-month-of-indias-cockroach-janta-party"
SRC_CJP_WIKI = "https://en.wikipedia.org/wiki/Cockroach_Janta_Party"
SRC_PETITION_FIRE = "https://www.change.org/p/fire-education-minister-of-india-mr-dharmendra-pradhan"
SRC_MOE_WHOSWHO = "https://www.education.gov.in/en/whos-who"
SRC_PGPORTAL = "https://pgportal.gov.in/Registration"
SRC_WANGCHUK_DAY18 = "https://www.tbsnews.net/world/south-asia/activist-sonam-wangchuk-enters-18th-day-hunger-strike-delhi-court-hears-plea"
SRC_ALJAZEERA_CJP = "https://www.aljazeera.com/news/2026/6/21/indias-cockroach-movement-camps-out-until-education-minister-resigns"

SRC_REACHLADAKH_DRAFT = "https://www.reachladakh.com/public/index.php/news/social-news/apex-body-leh-and-kargil-democratic-alliance-submits-detailed-draft-to-home-ministry"
SRC_KASHMIRLIFE_RALLY = "https://kashmirlife.net/ladakh-protesters-rally-for-statehood-sixth-schedule-protection-in-kargil-and-leh-428630/"
SRC_MHA_DIRECTORY = "https://www.mha.gov.in/sites/default/files/TelephoneDirectory_23012025.pdf"

SRC_SANSA_LEGAL = "https://www.sansalegal.com/post/supreme-court-stray-dog-verdict-2026-new-rules-on-relocation-shelters-and-euthanasia"
SRC_SC_OBSERVER = "https://www.scobserver.in/journal/what-did-the-supreme-court-hold-on-the-stray-dogs-matter/"
SRC_AWBI = "https://awbi.gov.in/"
SRC_IMPACTGURU_CHARITIES = "https://www.impactguru.com/info/street-dog-charities-in-india/"

HELP_ACTIONS = [
    dict(issue_id="neet-2026-leak", action_type="amplify", sort_order=1,
        title="Amplify on Social Media",
        description="The Cockroach Janta Party's Instagram (@cockroachjantaparty, 20M+ followers) and the #CockroachJantaParty hashtag are the active, verified channels for this movement. Share confirmed updates through these rather than starting new, unverified threads.",
        source_urls=[SRC_CJP_MONTH, SRC_CJP_WIKI], last_verified=date(2026,7,17)),
    dict(issue_id="neet-2026-leak", action_type="petition", sort_order=2,
        title="Sign and Share the Petition",
        description="An active Change.org petition calls for Education Minister Dharmendra Pradhan's resignation over the NEET-UG 2026 leak. Check the live signature count and add yours at the link below.",
        source_urls=[SRC_PETITION_FIRE], last_verified=date(2026,7,17)),
    dict(issue_id="neet-2026-leak", action_type="contact", sort_order=3,
        title="Contact the Ministry of Education",
        description="File a formal grievance through the government's CPGRAMS portal, or write directly to the Education Minister's office (minister.sm@gov.in, +91-11-24015222) demanding a public update on the NTA leak investigation.",
        source_urls=[SRC_MOE_WHOSWHO, SRC_PGPORTAL], last_verified=date(2026,7,17)),
    dict(issue_id="neet-2026-leak", action_type="physical", sort_order=4,
        title="Show Physical Solidarity",
        description="The CJP-led sit-in has continued at Jantar Mantar, Delhi since June 21, with organisers announcing a march to Parliament on July 20 to press the same demands. Check CJP's official channels for current logistics before attending.",
        source_urls=[SRC_WANGCHUK_DAY18, SRC_ALJAZEERA_CJP], last_verified=date(2026,7,17)),

    dict(issue_id="ladakh-sixth-schedule", action_type="amplify", sort_order=1,
        title="Follow and Share Verified Reporting",
        description="No single verified campaign hashtag exists for this movement. Instead, follow and share reporting directly from Ladakh-focused outlets and joint statements from the Leh Apex Body and Kargil Democratic Alliance, rather than amplifying unverified claims.",
        source_urls=[SRC_REACHLADAKH_DRAFT, SRC_KASHMIRLIFE_RALLY], last_verified=date(2026,7,17)),
    dict(issue_id="ladakh-sixth-schedule", action_type="contact", sort_order=2,
        title="Contact the Ministry of Home Affairs",
        description="File a grievance or query through the MHA's public grievance cell (dircoord-mha@nic.in, +91-11-23438061) or the CPGRAMS portal, asking for a public timeline on the Centre-Ladakh Sixth Schedule dialogue committee.",
        source_urls=[SRC_MHA_DIRECTORY, SRC_PGPORTAL], last_verified=date(2026,7,17)),
    dict(issue_id="ladakh-sixth-schedule", action_type="monitor", sort_order=3,
        title="Track the Dialogue Committee's Progress",
        description="The Leh Apex Body and Kargil Democratic Alliance submitted a detailed 40-page draft proposal to the Home Ministry in early 2026. Follow their joint statements for the Centre's response rather than relying on secondhand summaries.",
        source_urls=[SRC_REACHLADAKH_DRAFT], last_verified=date(2026,7,17)),

    dict(issue_id="sc-stray-dog-verdict", action_type="monitor", sort_order=1,
        title="File an RTI on Your District's Compliance",
        description="States must file compliance affidavits by August 7, 2026, with a consolidated report due to the Supreme Court by November 17, 2026. File an RTI with your municipal corporation asking for its current ABC (Animal Birth Control) centre count and relocation status ahead of these deadlines.",
        source_urls=[SRC_SANSA_LEGAL, SRC_SC_OBSERVER], last_verified=date(2026,7,17)),
    dict(issue_id="sc-stray-dog-verdict", action_type="volunteer", sort_order=2,
        title="Volunteer at an AWBI-Recognised ABC Centre",
        description="Veterinarians and volunteers can offer sterilisation, vaccination, or shelter-support hours directly through Animal Welfare Board of India-recognised organisations. Verify an organisation's AWBI recognition before volunteering.",
        source_urls=[SRC_AWBI, SRC_IMPACTGURU_CHARITIES], last_verified=date(2026,7,17)),
    dict(issue_id="sc-stray-dog-verdict", action_type="donate", sort_order=3,
        title="Support a Vetted Shelter's ABC Programme",
        description="Established shelters running Animal Birth Control programmes rely on donations for food, sterilisation surgeries, and vaccination drives. Confirm an organisation's registration and AWBI recognition before giving.",
        source_urls=[SRC_AWBI, SRC_IMPACTGURU_CHARITIES], last_verified=date(2026,7,17)),
]

inserted, updated = 0, 0
for row in HELP_ACTIONS:
    existing = (
        db.query(HelpAction)
        .filter(
            HelpAction.issue_id == row["issue_id"],
            HelpAction.action_type == row["action_type"],
            HelpAction.title == row["title"],
        )
        .first()
    )
    if existing:
        existing.description = row["description"]
        existing.source_urls = row["source_urls"]
        existing.last_verified = row["last_verified"]
        existing.sort_order = row["sort_order"]
        existing.still_active = True
        updated += 1
    else:
        db.add(HelpAction(**row))
        inserted += 1

db.commit()
print(
    f"Backfill complete: sensitive-content flags updated on 3 issues, "
    f"{inserted} help_action row(s) inserted, {updated} updated."
)
