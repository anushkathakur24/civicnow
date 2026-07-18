"""One-off backfill: bring the NEET-UG issue's production data up to date
with Sonam Wangchuk's hunger-strike escalation as of 2026-07-18 (Delhi HC
medical-oversight PIL, and his hospitalisation at Safdarjung on day 21).

Why a script and not just re-running seed.py: production already has this
issue seeded, and scripts/seed.py exits immediately once any Issue row
exists. This mirrors the pattern used for the July 2026 support-notice/
help-actions backfill (see backfill_support_and_help_actions_2026_07.py).

What this does, all idempotent (safe to re-run):
  1. Updates the NEET-UG issue's summary/current_ask/sensitive_note and sets
     last_fact_checked_at to 2026-07-18 (only this issue was re-verified on
     this date — Ladakh and the stray-dog verdict are untouched).
  2. Inserts 6 new Source rows (matched by issue_id + url — skipped if the
     exact URL is already present).
  3. Inserts 3 new TimelineEvent rows (matched by issue_id + event_date —
     skipped if an event already exists on that date, since none of the
     three new dates collide with existing timeline entries).
  4. Updates the existing "Show Physical Solidarity" HelpAction (Wangchuk is
     no longer at the protest site) and inserts a new "Track the
     Court-Ordered Medical Oversight" HelpAction (matched by issue_id +
     action_type + title, same convention as the prior backfill script).
  5. Inserts 5 new ActionDefinition rows — citizen, lawyer, doctor,
     content_creator, and the new public_figure persona (matched by
     issue_id + persona_id + action_text).

Run once against production with the real DATABASE_URL, e.g.:
    DATABASE_URL=<your production URL> python3 scripts/backfill_wangchuk_hospitalization_2026_07_18.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timezone
from app.db.session import SessionLocal
from app.models.civic import Issue, Source, TimelineEvent, HelpAction, ActionDefinition

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
    "accountability. Sonam Wangchuk's hunger strike in solidarity with the protest escalated "
    "sharply in mid-July: a Delhi High Court PIL forced daily medical monitoring, and on July 18 "
    "(day 21) Delhi Police removed him from Jantar Mantar to Safdarjung Hospital, where he "
    "continues his fast under medical supervision."
)
issue.current_ask = (
    "CJP and allied protesters are demanding Education Minister Dharmendra Pradhan's resignation "
    "and systemic NTA reform. As of the latest reporting, the minister has not resigned; Wangchuk "
    "remains hospitalised and has not called off his fast."
)
issue.sensitive_note = (
    "This issue involves student suicides and a health-critical hunger strike that led to the "
    "faster's hospitalization."
)
issue.last_fact_checked_at = datetime(2026, 7, 18, tzinfo=timezone.utc)
db.flush()

# ---- 2. New sources ---------------------------------------------------------

SRC_LIVELAW_PIL = "https://www.livelaw.in/high-court/delhi-high-court/sonam-wangchuk-hunger-strike-centre-delhi-govt-response-sought-541299"
SRC_BRUT_HEARING = "https://www.brut.media/in/articles/india/society/sonam-wangchuk-hunger-strike-live-delhi-hc-hearing-health-updates-today"
SRC_THEPRINT_HOSPITAL = "https://theprint.in/politics/delhi-police-shift-wangchuk-to-hospital-cjps-dipke-alleges-activist-taken-by-force/2989669/"
SRC_INDIATV_HOSPITAL = "https://www.indiatvnews.com/news/india/why-was-sonam-wangchuk-shifted-to-safdarjung-hospital-and-protesters-removed-from-jantar-mantar-explained-2026-07-18-1048628"
SRC_LIVEMINT_TIMELINE = "https://www.livemint.com/politics/news/sonam-wangchuk-5-hunger-strikes-explained-causes-outcomes-and-the-jantar-mantar-protest-dipke-cjp-neet-pradhan-11784174825356.html"
SRC_OUTLOOK_60FIGURES = "https://www.outlookindia.com/art-entertainment/sonam-wangchuk-hunger-strike-60-public-figures-urge-him-to-stop-fast"

NEW_SOURCES = [
    ("'Urgent': Delhi High Court Seeks Centre, Delhi Govt Stand On Plea Seeking To End Sonam Wangchuk's Hunger Strike — LiveLaw", SRC_LIVELAW_PIL),
    ("Sonam Wangchuk Hunger Strike Live: Delhi HC Hearing, Health Updates — Brut", SRC_BRUT_HEARING),
    ("Delhi Police 'shift' Wangchuk to hospital, CJP's Dipke alleges activist taken 'by force' — The Print", SRC_THEPRINT_HOSPITAL),
    ("Why was Sonam Wangchuk shifted to Safdarjung Hospital and protesters removed from Jantar Mantar, explained — India TV News", SRC_INDIATV_HOSPITAL),
    ("Sonam Wangchuk hunger strike: 5 hunger strikes explained — Livemint", SRC_LIVEMINT_TIMELINE),
    ("Sonam Wangchuk Hunger Strike: 60 Public Figures Urge Him To Stop Fast — Outlook India", SRC_OUTLOOK_60FIGURES),
]

sources_added = 0
for title, url in NEW_SOURCES:
    exists = db.query(Source).filter(Source.issue_id == ISSUE_ID, Source.url == url).first()
    if not exists:
        db.add(Source(issue_id=ISSUE_ID, title=title, url=url))
        sources_added += 1

# ---- 3. New timeline events --------------------------------------------------

NEW_EVENTS = [
    (date(2026, 7, 15), "A PIL is filed in the Delhi High Court seeking urgent medical intervention for Wangchuk as his hunger strike continues.", SRC_LIVELAW_PIL),
    (date(2026, 7, 16), "The Delhi High Court hears the plea and directs daily clinical monitoring of Wangchuk's health as the fast enters its 19th day; reports describe him surviving on little beyond salt water amid critical health warnings.", SRC_BRUT_HEARING),
    (date(2026, 7, 18), "On day 21 of the fast, Delhi Police remove Wangchuk from Jantar Mantar and shift him to Safdarjung Hospital following the High Court's directions; CJP's Dipke alleges he was taken 'by force'. He remains under continuous medical monitoring and has not called off his fast. This is a contested characterization — see sources below rather than treating either account as settled.", SRC_THEPRINT_HOSPITAL),
]

events_added = 0
for event_date, event_text, source_url in NEW_EVENTS:
    exists = db.query(TimelineEvent).filter(TimelineEvent.issue_id == ISSUE_ID, TimelineEvent.event_date == event_date).first()
    if not exists:
        db.add(TimelineEvent(issue_id=ISSUE_ID, event_date=event_date, event_text=event_text, source_url=source_url, verified=True))
        events_added += 1

db.flush()

# ---- 4. Help actions: update the stale one, add the new one ----------------

physical = (
    db.query(HelpAction)
    .filter(HelpAction.issue_id == ISSUE_ID, HelpAction.action_type == "physical", HelpAction.title == "Show Physical Solidarity")
    .first()
)
if physical:
    physical.description = (
        "Wangchuk was removed from Jantar Mantar by Delhi Police on July 18 (day 21) and "
        "hospitalised at Safdarjung under High Court-ordered medical monitoring — the situation "
        "is changing fast, so confirm the CJP sit-in's current status and any march plans through "
        "their official channels before attending, rather than assuming the June 21 encampment "
        "logistics still hold."
    )
    physical.source_urls = [SRC_THEPRINT_HOSPITAL, SRC_INDIATV_HOSPITAL]
    physical.last_verified = date(2026, 7, 18)
    physical.still_active = True

oversight = (
    db.query(HelpAction)
    .filter(HelpAction.issue_id == ISSUE_ID, HelpAction.action_type == "monitor", HelpAction.title == "Track the Court-Ordered Medical Oversight")
    .first()
)
if not oversight:
    db.add(HelpAction(
        issue_id=ISSUE_ID, action_type="monitor", sort_order=5,
        title="Track the Court-Ordered Medical Oversight",
        description=(
            "A Delhi High Court PIL filed July 15 led to a directive for daily clinical monitoring "
            "of Wangchuk's health, and preceded his July 18 hospitalisation — this is a real, "
            "ongoing legal proceeding with implications for protester-welfare obligations beyond "
            "this one case."
        ),
        source_urls=[SRC_LIVELAW_PIL, SRC_THEPRINT_HOSPITAL], last_verified=date(2026, 7, 18),
    ))

# ---- 5. New role-matched actions, including the new public_figure persona --

NEW_ACTIONS = [
    dict(persona_id="citizen",
        action_text="Share only confirmed updates on Wangchuk's hospitalisation from named outlets (LiveLaw, The Print, India TV News) — whether he was moved voluntarily or 'by force' is actively disputed, and unverified clips are spreading faster than corrections.",
        impact="medium", category="awareness", verification_method="self_reported", base_points=30, effort_hours=1, recurring=True),
    dict(persona_id="lawyer",
        action_text="Track the Delhi High Court's July 15 PIL ordering daily clinical monitoring of Wangchuk — it's a live proceeding with implications for protester-welfare obligations during hunger strikes generally, not just this case.",
        impact="high", category="rti_grievance", verification_method="ngo_confirmation", base_points=50, effort_hours=3, recurring=True),
    dict(persona_id="doctor",
        action_text="Help counter medical misinformation circulating about hunger-strike risk and post-fast recovery alongside Wangchuk's hospitalisation — route corrections through a medical association or established outlet, not direct outreach to him or his family.",
        impact="medium", category="awareness", verification_method="social_post_verification", base_points=30, effort_hours=2, recurring=True),
    dict(persona_id="content_creator",
        action_text="Cover the hospitalisation citing named outlets rather than unverified social clips — the 'voluntary vs. forced removal' question is genuinely contested right now, and getting it wrong either direction does real harm.",
        impact="high", category="awareness", verification_method="social_post_verification", base_points=50, effort_hours=3, recurring=True),
    dict(persona_id="public_figure",
        action_text="Use a named, public platform the way Zeenat Aman, Swara Bhaskar, Prakash Raj, and the 60+ writers/academics who signed an open letter have — a public, attributable appeal for government dialogue and de-escalation carries more institutional weight than an anonymous share.",
        impact="high", category="advocacy", verification_method="social_post_verification", base_points=50, effort_hours=1, recurring=False),
]

actions_added = 0
for row in NEW_ACTIONS:
    exists = (
        db.query(ActionDefinition)
        .filter(ActionDefinition.issue_id == ISSUE_ID, ActionDefinition.persona_id == row["persona_id"], ActionDefinition.action_text == row["action_text"])
        .first()
    )
    if not exists:
        db.add(ActionDefinition(issue_id=ISSUE_ID, **row))
        actions_added += 1

db.commit()
print(
    f"Backfill complete for '{ISSUE_ID}': issue fields updated, "
    f"{sources_added} source(s) added, {events_added} timeline event(s) added, "
    f"help-action list updated (1 revised, 1 added if new), {actions_added} role-matched action(s) added."
)
