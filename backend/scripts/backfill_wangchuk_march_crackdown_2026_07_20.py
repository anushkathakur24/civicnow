"""One-off backfill: bring the NEET-UG issue's production data up to date
with events since the July 18 hospitalization backfill
(backfill_wangchuk_hospitalization_2026_07_18.py): Gitanjali Angmo's July 19
Delhi HC petition, and the July 20 police lathi charge/tear gas against the
CJP's "Sansad Chalo" march to Parliament, as Wangchuk's fast reaches day 23.

Why a script and not just re-running seed.py: production already has this
issue seeded, and scripts/seed.py exits immediately once any Issue row
exists. Same pattern as the two prior NEET-UG backfills.

The injury/assault allegations here are genuinely contested: CJP alleges
serious injuries including to Wangchuk's wife; Delhi Police issued an
on-record denial the same day calling the claims "completely false and
misleading." Both accounts are represented in the timeline text below
rather than either being asserted as settled fact, per this project's own
standard for high-stakes, actively disputed claims.

What this does, all idempotent (safe to re-run):
  1. Updates the NEET-UG issue's summary/current_ask and sets
     last_fact_checked_at to 2026-07-20.
  2. Inserts 4 new Source rows (matched by issue_id + url).
  3. Inserts 3 new TimelineEvent rows (matched by issue_id + event_date).
  4. Updates the existing "Show Physical Solidarity" and "Track the
     Court-Ordered Medical Oversight" HelpActions (the latter is renamed to
     "Track the Ongoing Court Proceedings" to cover both live cases) —
     matched by issue_id + action_type + OLD title, since the title itself
     is changing on one of them.

Run once against production with the real DATABASE_URL, e.g.:
    DATABASE_URL=<your production URL> python3 scripts/backfill_wangchuk_march_crackdown_2026_07_20.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timezone
from app.db.session import SessionLocal
from app.models.civic import Issue, Source, TimelineEvent, HelpAction

db = SessionLocal()

ISSUE_ID = "neet-2026-leak"

# ---- 1. Issue-level fields -------------------------------------------------

issue = db.query(Issue).filter(Issue.id == ISSUE_ID).first()
if not issue:
    print(f"'{ISSUE_ID}' not found — nothing to backfill. Has the base seed run yet?")
    raise SystemExit(1)

issue.summary = (
    "NEET-UG 2026, India's national medical entrance exam originally held on May 3, 2026, was "
    "cancelled on May 12 after NTA's own investigation found overlaps between a pre-circulated "
    "guess paper and the actual question paper. At least 13 student suicides have since been "
    "linked to the crisis, per compiled police and media reports, fuelling nationwide calls for "
    "accountability. Sonam Wangchuk's hunger strike in solidarity with the protest has continued "
    "past three weeks despite hospitalisation: after Delhi Police moved him to Safdarjung Hospital "
    "on July 18, his wife petitioned the Delhi High Court disputing his continued confinement, and "
    "a CJP march to Parliament on July 20 was met with police lathi charge and tear gas, an "
    "incident CJP and Delhi Police dispute the severity of. Wangchuk remains on hunger strike as "
    "of day 23."
)
issue.current_ask = (
    "CJP and allied protesters are demanding Education Minister Dharmendra Pradhan's resignation "
    "and systemic NTA reform. As of the latest reporting, the minister has not resigned; Wangchuk "
    "remains on hunger strike (day 23) and says he will continue until protest leaders are allowed "
    "to meet MPs at Parliament or him at the hospital."
)
issue.last_fact_checked_at = datetime(2026, 7, 20, tzinfo=timezone.utc)
db.flush()

# ---- 2. New sources ---------------------------------------------------------

SRC_TRIBUNE_DAY23 = "https://www.tribuneindia.com/news/india/day-23-sonam-wangchuk-resumes-hunger-strike-after-police-action-against-protesters/"
SRC_TRIBUNE_PHOTOS = "https://www.tribuneindia.com/news/delhi/in-photos-police-use-teargas-lathis-during-cjp-protest/"
SRC_TRIBUNE_LIVEBLOG = "https://www.tribuneindia.com/live-blog/delhi/live-updates-thousands-gather-at-jantar-mantar-ahead-of-cjps-march-to-parliament/"
SRC_BARANDBENCH_HC = "https://www.barandbench.com/news/litigation/no-medical-emergency-to-remove-sonam-wangchuk-from-protest-site-gitanjali-angmo-moves-delhi-hc"
# Still needed below to re-point the "monitor" HelpAction's source list.
SRC_LIVELAW_PIL = "https://www.livelaw.in/high-court/delhi-high-court/sonam-wangchuk-hunger-strike-centre-delhi-govt-response-sought-541299"

NEW_SOURCES = [
    ("CJP protest: Sonam Wangchuk resumes hunger strike after police resort to lathi-charge, teargas against protesting youth", SRC_TRIBUNE_DAY23),
    ("In photos: Police use teargas, lathis during CJP protest", SRC_TRIBUNE_PHOTOS),
    ("'Sansad Chalo' march: CJP alleges police excesses after crackdown, continues sit-in near Kerala House", SRC_TRIBUNE_LIVEBLOG),
    ("No medical emergency to remove Sonam Wangchuk from protest site: Gitanjali Angmo moves Delhi HC", SRC_BARANDBENCH_HC),
]

sources_added = 0
for title, url in NEW_SOURCES:
    exists = db.query(Source).filter(Source.issue_id == ISSUE_ID, Source.url == url).first()
    if not exists:
        db.add(Source(issue_id=ISSUE_ID, title=title, url=url))
        sources_added += 1

# ---- 3. New timeline events --------------------------------------------------

NEW_EVENTS = [
    (date(2026, 7, 19), "Wangchuk's wife, Gitanjali J Angmo, petitions the Delhi High Court alleging he is being held at Safdarjung Hospital without any legal order and disputing the hospital's blood-test readings; she seeks his immediate discharge and access for his lawyers and doctors.", SRC_BARANDBENCH_HC),
    (date(2026, 7, 20), "On the opening day of Parliament's Monsoon Session, CJP's 'Sansad Chalo' march toward Parliament is met with police lathi charge and tear gas; the stage at Jantar Mantar is dismantled and the sit-in shifts near Kerala House. CJP alleges serious student injuries and that Angmo was assaulted; Delhi Police issued an official denial on X the same day, calling the assault claims 'completely false and misleading' and saying no one was 'subjected to targeted assault.' Both accounts remain contested. See sources below rather than treating either as settled.", SRC_TRIBUNE_LIVEBLOG),
    (date(2026, 7, 20), "Writing from Safdarjung Hospital on day 23 of his fast, Wangchuk vows to continue his hunger strike until protest leaders are allowed to meet MPs at Parliament or him at the hospital, citing what he called the 'brutality' shown toward the day's protesters.", SRC_TRIBUNE_DAY23),
]

events_added = 0
for event_date, event_text, source_url in NEW_EVENTS:
    exists = db.query(TimelineEvent).filter(TimelineEvent.issue_id == ISSUE_ID, TimelineEvent.event_date == event_date, TimelineEvent.event_text == event_text).first()
    if not exists:
        db.add(TimelineEvent(issue_id=ISSUE_ID, event_date=event_date, event_text=event_text, source_url=source_url, verified=True))
        events_added += 1

db.flush()

# ---- 4. Help actions: update both to reflect the current state -------------

physical = (
    db.query(HelpAction)
    .filter(HelpAction.issue_id == ISSUE_ID, HelpAction.action_type == "physical", HelpAction.title == "Show Physical Solidarity")
    .first()
)
if physical:
    physical.description = (
        "Police dismantled the Jantar Mantar stage during the July 20 'Sansad Chalo' march to "
        "Parliament, which was met with lathi charge and tear gas; the sit-in has since continued "
        "near Kerala House. The situation is changing fast, so confirm the current protest location "
        "and any march plans through CJP's official channels before attending, rather than assuming "
        "the earlier Jantar Mantar logistics still hold."
    )
    physical.source_urls = [SRC_TRIBUNE_LIVEBLOG, SRC_TRIBUNE_PHOTOS]
    physical.last_verified = date(2026, 7, 20)
    physical.still_active = True
    physical_updated = True
else:
    physical_updated = False

oversight = (
    db.query(HelpAction)
    .filter(HelpAction.issue_id == ISSUE_ID, HelpAction.action_type == "monitor", HelpAction.title == "Track the Court-Ordered Medical Oversight")
    .first()
)
if oversight:
    oversight.title = "Track the Ongoing Court Proceedings"
    oversight.description = (
        "Two related cases are live: the Delhi High Court PIL from July 15 that led to "
        "court-ordered daily medical monitoring of Wangchuk, and a separate July 19 petition from "
        "his wife, Gitanjali Angmo, disputing his continued hospitalisation and seeking his "
        "discharge. Both have real implications for protester-welfare obligations beyond this one "
        "case."
    )
    oversight.source_urls = [SRC_LIVELAW_PIL, SRC_BARANDBENCH_HC]
    oversight.last_verified = date(2026, 7, 20)
    oversight_updated = True
else:
    oversight_updated = False

db.commit()
print(
    f"Backfill complete for '{ISSUE_ID}': issue fields updated, "
    f"{sources_added} source(s) added, {events_added} timeline event(s) added, "
    f"physical action {'updated' if physical_updated else 'NOT FOUND'}, "
    f"monitor action {'updated' if oversight_updated else 'NOT FOUND'}."
)
