"""Seed demo data: the 3 CivicNow issues + actions + a demo admin and demo user.

Every fact below (timeline events, promises, responsible bodies, sources) was
researched from real reporting during earlier work on this project — none of
it is placeholder/lorem-ipsum content. Each timeline event and promise that
has a specific source is linked via source_url; issue-level `sources` lists
the full citations. This is demo/seed data (not a live feed), which is why
every issue page shows an explicit "last updated" timestamp rather than
implying it's continuously refreshed — see IssueSummary.updated_at.

Run with: DATABASE_URL=... python3 scripts/seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timedelta, timezone
from app.db.session import SessionLocal, engine, Base
from app import models  # noqa: F401 — ensures every model (incl. GovernmentBody,
# AuditLog, gamification tables) is registered on Base.metadata before the
# create_all() fallback below runs, same reasoning as alembic/env.py.
from app.models.civic import Issue, TimelineEvent, Promise, Source, ResponsibleBody, ActionDefinition, NGO
from app.models.user import User
from app.core.security import hash_password
from app.services.audit import log_change

Base.metadata.create_all(bind=engine)  # no-op if Alembic already ran; safe for fresh sandbox/CI DBs
db = SessionLocal()

if db.query(Issue).count() > 0:
    print("Already seeded — skipping.")
    raise SystemExit(0)

# Created up-front (rather than at the bottom of the file, where the admin
# account used to be seeded) so its id is available to attribute the
# version-history entries below to a real actor instead of leaving them
# actor_id=None. This is still just "the seed script authored this content" —
# not a claim that any editorial review happened.
backdated = datetime.now(timezone.utc) - timedelta(days=30)
admin = User(
    email="admin@civicnow.demo", username="admin", display_name="CivicNow Admin",
    password_hash=hash_password("DemoAdmin!2026"), role="admin",
    email_verified_at=backdated, created_at=backdated,
)
demo_user = User(
    email="demo@civicnow.demo", username="demo_citizen", display_name="Demo Citizen",
    password_hash=hash_password("DemoUser!2026"), role="user", persona_id="citizen", city="Bengaluru",
    email_verified_at=backdated, created_at=backdated, leaderboard_opt_in=True,
)
db.add_all([admin, demo_user])
db.flush()

issue1 = Issue(
    id="neet-2026-leak", title="NEET-UG 2026 Paper Leak & Accountability Crisis",
    category="Education / Exam Integrity", urgency="critical", status="ongoing",
    summary="NEET-UG 2026, India's national medical entrance exam originally held on May 3, 2026, was cancelled on May 12 after NTA's own investigation found overlaps between a pre-circulated guess paper and the actual question paper. At least 13 student suicides have since been linked to the crisis, per compiled police and media reports, fuelling nationwide calls for accountability.",
    current_ask="CJP and allied protesters are demanding Education Minister Dharmendra Pradhan's resignation and systemic NTA reform. As of the latest reporting, the minister has not resigned.",
    accountability_mechanism="Public Examinations (Prevention of Unfair Means) Act, 2024 — criminalises leaks and organised cheating. Track whether any arrests/prosecutions under this Act have resulted from the NEET-UG 2026 leak specifically.",
    sensitive_note="This issue involves student suicides and an active, health-critical hunger strike. If you or someone you know is in distress, iCall (9152987821) and the Vandrevala Foundation helpline (1860-2662-345) offer free, confidential support in India.",
    published=True,
)
issue2 = Issue(
    id="ladakh-sixth-schedule", title="Ladakh Statehood & Sixth Schedule Movement",
    category="Governance / Constitutional Rights", urgency="high", status="in negotiation",
    summary="A years-long movement for full statehood for Ladakh and/or Sixth Schedule constitutional protections (safeguarding tribal land, culture and environment) has been led by groups including the Leh Apex Body and Kargil Democratic Alliance, with Sonam Wangchuk as its most visible voice. Protests in September 2025 turned violent, leaving four dead; Wangchuk was detained for nearly six months under the National Security Act before being released.",
    current_ask="Sixth Schedule protections and/or restoration of statehood/democracy for Ladakh, per Leh Apex Body and Kargil Democratic Alliance demands.",
    accountability_mechanism="Track outcomes of the Centre-Ladakh dialogue committee, any Sixth Schedule/statehood legislation introduced, and the status of the related Supreme Court case.",
    sensitive_note=None,
    published=True,
)
issue3 = Issue(
    id="sc-stray-dog-verdict", title="Supreme Court Stray Dog Verdict — Municipal Compliance Tracker",
    category="Public Safety / Animal Welfare / Municipal Accountability", urgency="medium", status="compliance deadline approaching",
    summary="In May 2026 the Supreme Court ordered states and union territories to sterilise and permanently relocate stray dogs from hospitals, schools, bus stands and railway stations, set up at least one Animal Birth Control (ABC) centre per district, and restrict euthanasia to narrow, documented cases. Compliance affidavits are due August 7, 2026, with a consolidated report due to the Court by November 17, 2026.",
    current_ask="Citizens can push their local municipal body to publish its ABC centre and relocation compliance status ahead of the deadlines.",
    accountability_mechanism="Municipal bodies that fail to establish adequate shelter/ABC infrastructure face potential contempt-of-court proceedings. This is directly trackable district-by-district before the two 2026 deadlines.",
    sensitive_note=None,
    published=True,
)

# All three issues were re-verified against live web search on the date this
# seed script was last edited (see git history for the exact commit date) —
# `last_fact_checked_at` reflects that real pass, deliberately distinct from
# `updated_at`, which just tracks the row's last write regardless of whether
# anyone re-checked the underlying facts.
fact_checked_at = datetime.now(timezone.utc)
for issue in (issue1, issue2, issue3):
    issue.last_fact_checked_at = fact_checked_at

db.add_all([issue1, issue2, issue3])
db.flush()

# ---- Sources (full citation lists per issue) ------------------------------

SRC_ALJAZEERA_HUNGER = "https://www.aljazeera.com/news/2026/7/14/indian-activist-wangchuk-urged-to-end-hunger-strike-over-exam-paper-leaks"
SRC_CNN_HUNGER = "https://www.cnn.com/2026/07/15/world/video/hunger-strike-sonam-wangchuk-india-education-exams-mogul-ldn-digvid"
SRC_DECCAN_DAY19 = "https://www.deccanherald.com/india/sonam-wangchuk-enters-critical-stage-of-hunger-strike-on-day-19-loses-over-9-kg-doctors-warn-of-organ-damage-4075690"
SRC_CNN_CJP = "https://www.cnn.com/2026/06/26/india/india-cockroach-janta-party-delhi-protest-intl-hnk"
SRC_ALJAZEERA_CJP = "https://www.aljazeera.com/news/2026/6/21/indias-cockroach-movement-camps-out-until-education-minister-resigns"
# High-stakes claim (student suicides) gets 3 independent sources, not 1 —
# per the editorial standard that the more serious the claim, the more
# corroboration it needs before it's stated as fact on this site.
SRC_ALJAZEERA_SUICIDES = "https://www.aljazeera.com/news/2026/5/26/come-back-my-son-indian-exam-leak-leaves-trail-of-death-despair-anger"
SRC_OUTLOOK_SCANDAL = "https://www.outlookindia.com/national/neet-ug-2026-paper-leak-scandal-collapse-of-trust-student-suicides-and-indias-medical-entrance-crisis"
SRC_OUTLOOK_13SUICIDES = "https://www.outlookindia.com/amp/story/national/13-reported-suicides-after-neet-paper-leak"

db.add_all([
    Source(issue_id="neet-2026-leak", title="Indian activist Wangchuk urged to end hunger strike over exam paper leaks — Al Jazeera", url=SRC_ALJAZEERA_HUNGER),
    Source(issue_id="neet-2026-leak", title="Two weeks of hunger in protest of India's exam system — CNN", url=SRC_CNN_HUNGER),
    Source(issue_id="neet-2026-leak", title="Sonam Wangchuk enters critical stage of hunger strike on day 19 — Deccan Herald", url=SRC_DECCAN_DAY19),
    Source(issue_id="neet-2026-leak", title="Cockroach Janta Party: India's viral youth movement hits the streets of the capital — CNN", url=SRC_CNN_CJP),
    Source(issue_id="neet-2026-leak", title="India's 'Cockroach' movement camps out until education minister resigns — Al Jazeera", url=SRC_ALJAZEERA_CJP),
    Source(issue_id="neet-2026-leak", title="'Come back, my son': Indian exam leak leaves trail of death, despair, anger — Al Jazeera", url=SRC_ALJAZEERA_SUICIDES),
    Source(issue_id="neet-2026-leak", title="NEET-UG 2026 Paper Leak Scandal: Collapse of Trust, Student Suicides and India's Medical Entrance Crisis — Outlook India", url=SRC_OUTLOOK_SCANDAL),
    Source(issue_id="neet-2026-leak", title="13 Reported Suicides After NEET Paper Leak — Outlook India", url=SRC_OUTLOOK_13SUICIDES),
])

db.add_all([
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,5,3), event_text="NEET-UG 2026 held; leak and irregularities surface shortly after.", verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,5,12), event_text="Exam cancelled after NTA's own investigation finds overlaps between a pre-circulated guess paper and the actual question paper.", source_url=SRC_OUTLOOK_SCANDAL, verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,5,26), event_text="At least 13 student suicides are linked to the crisis in compiled police and media reports, as the forced re-test drags on. This is a sensitive, actively-reported figure — see sources below rather than treating it as final.", source_url=SRC_ALJAZEERA_SUICIDES, verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,5,20), event_text="Abhijeet Dipke (30, Boston University graduate) launches the satirical 'Cockroach Janta Party' (CJP) on Instagram; gains ~22 million followers within days.", source_url=SRC_CNN_CJP, verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,6,6), event_text="Dipke lands in India and leads a mass youth sit-in in Delhi, followed by demonstrations in Pune, Jaipur, Lucknow and Bengaluru.", source_url=SRC_CNN_CJP, verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,6,21), event_text="CJP sit-in at Jantar Mantar, Delhi becomes a continuous encampment; protesters say they will not leave until Education Minister Dharmendra Pradhan resigns.", source_url=SRC_ALJAZEERA_CJP, verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,6,28), event_text="Sonam Wangchuk begins an indefinite hunger strike at the same site in solidarity with the protest.", source_url=SRC_ALJAZEERA_HUNGER, verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,7,14), event_text="Wangchuk enters day 17-19 of his fast, has lost over 9 kg; doctors warn of organ damage. Opposition leaders publicly urge him to stop.", source_url=SRC_DECCAN_DAY19, verified=True),
    Promise(issue_id="neet-2026-leak", made_by="Education Ministry", promise_text="Cancel and re-conduct the compromised exam", status="kept", source_url=SRC_ALJAZEERA_HUNGER),
    Promise(issue_id="neet-2026-leak", made_by="Education Ministry", promise_text="Education Minister resignation (demanded by CJP and allied protesters)", status="pending", source_url=SRC_ALJAZEERA_CJP),
    ResponsibleBody(issue_id="neet-2026-leak", body_name="Ministry of Education"),
    ResponsibleBody(issue_id="neet-2026-leak", body_name="National Testing Agency (NTA) — conducts NEET-UG"),
    ResponsibleBody(issue_id="neet-2026-leak", body_name="Central Bureau of Investigation (if the leak probe is referred to it)"),
])

# ---- Ladakh -----------------------------------------------------------

SRC_ALJAZEERA_RELEASE = "https://www.aljazeera.com/news/2026/3/14/india-releases-ladakh-activist-sonam-wangchuk-after-six-months-in-jail"
SRC_NEWSLAUNDRY_FLEXIBLE = "https://www.newslaundry.com/2026/03/17/talks-are-a-give-and-take-sonam-wangchuk-on-6th-schedule-statehood-and-being-flexible"
SRC_THEWEEK_NSA = "https://www.theweek.in/news/india/2026/03/14/centre-revokes-sonam-wangchuks-nsa-detention-signals-fresh-opening-for-dialogue-in-ladakh.html"

db.add_all([
    Source(issue_id="ladakh-sixth-schedule", title="India releases Ladakh activist Sonam Wangchuk after six months in jail — Al Jazeera", url=SRC_ALJAZEERA_RELEASE),
    Source(issue_id="ladakh-sixth-schedule", title="'Talks are a give-and-take': Sonam Wangchuk on 6th schedule, statehood — Newslaundry", url=SRC_NEWSLAUNDRY_FLEXIBLE),
    Source(issue_id="ladakh-sixth-schedule", title="Centre revokes Sonam Wangchuk's NSA detention, signals fresh opening for dialogue — The Week", url=SRC_THEWEEK_NSA),
])

db.add_all([
    TimelineEvent(issue_id="ladakh-sixth-schedule", event_date=date(2025,9,24), event_text="Protests in Ladakh turn violent; four people killed, dozens injured. Centre blames 'provocative speeches' by Wangchuk.", source_url=SRC_THEWEEK_NSA, verified=True),
    TimelineEvent(issue_id="ladakh-sixth-schedule", event_date=date(2025,9,26), event_text="Wangchuk detained and charged under the National Security Act (NSA).", source_url=SRC_THEWEEK_NSA, verified=True),
    TimelineEvent(issue_id="ladakh-sixth-schedule", event_date=date(2026,3,14), event_text="Ministry of Home Affairs revokes Wangchuk's NSA detention 'with immediate effect' after nearly six months in custody.", source_url=SRC_ALJAZEERA_RELEASE, verified=True),
    TimelineEvent(issue_id="ladakh-sixth-schedule", event_date=date(2026,3,17), event_text="In his first public remarks after release, Wangchuk says both sides must stay 'flexible' — Ladakh would accept either full statehood or Sixth Schedule protections, ideally both.", source_url=SRC_NEWSLAUNDRY_FLEXIBLE, verified=True),
    ResponsibleBody(issue_id="ladakh-sixth-schedule", body_name="Ministry of Home Affairs"),
    ResponsibleBody(issue_id="ladakh-sixth-schedule", body_name="Union Territory Administration of Ladakh"),
    ResponsibleBody(issue_id="ladakh-sixth-schedule", body_name="Supreme Court of India (ongoing related case)"),
])

# ---- SC stray dog verdict ----------------------------------------------

SRC_SANSA_LEGAL = "https://www.sansalegal.com/post/supreme-court-stray-dog-verdict-2026-new-rules-on-relocation-shelters-and-euthanasia"
SRC_SC_OBSERVER = "https://www.scobserver.in/journal/what-did-the-supreme-court-hold-on-the-stray-dogs-matter/"

db.add_all([
    Source(issue_id="sc-stray-dog-verdict", title="Supreme Court Stray Dog Verdict 2026: New Rules on Relocation, Shelters and Euthanasia", url=SRC_SANSA_LEGAL),
    Source(issue_id="sc-stray-dog-verdict", title="What did the Supreme Court hold on the stray-dogs matter? — Supreme Court Observer", url=SRC_SC_OBSERVER),
])

db.add_all([
    TimelineEvent(issue_id="sc-stray-dog-verdict", event_date=date(2026,5,12), event_text="Supreme Court bench (Justices Vikram Nath, Sandeep Mehta, N.V. Anjaria) issues the verdict.", source_url=SRC_SC_OBSERVER, verified=True),
    TimelineEvent(issue_id="sc-stray-dog-verdict", event_date=date(2026,8,7), event_text="Deadline: all states/UTs must file compliance affidavits.", source_url=SRC_SANSA_LEGAL, verified=True),
    TimelineEvent(issue_id="sc-stray-dog-verdict", event_date=date(2026,11,17), event_text="Deadline: consolidated compliance report due to the Supreme Court.", source_url=SRC_SANSA_LEGAL, verified=True),
    ResponsibleBody(issue_id="sc-stray-dog-verdict", body_name="State and Union Territory governments"),
    ResponsibleBody(issue_id="sc-stray-dog-verdict", body_name="Municipal corporations / local bodies"),
    ResponsibleBody(issue_id="sc-stray-dog-verdict", body_name="Animal Welfare Board of India"),
])

# ---- Actions: existing personas -----------------------------------------

db.add_all([
    ActionDefinition(issue_id="neet-2026-leak", persona_id="citizen", action_text="File an RTI to the Ministry of Education / NTA on leak investigation status.", impact="high", category="rti_grievance", verification_method="document_upload", base_points=50, effort_hours=1, cost_inr=10, recurring=False),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="citizen", action_text="Verify and share only sourced information.", impact="medium", category="awareness", verification_method="self_reported", base_points=30, effort_hours=1, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="content_creator", action_text="Publish a fact-checked explainer using the verified timeline.", impact="high", category="awareness", verification_method="social_post_verification", base_points=50, effort_hours=3, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="working_professional", action_text="Donate to a vetted student legal-aid fund.", impact="medium", category="donation", verification_method="receipt_upload", base_points=30, cost_inr=500, recurring=False),
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="citizen", action_text="File an RTI on your district's ABC centre status.", impact="high", category="rti_grievance", verification_method="document_upload", base_points=50, effort_hours=1, cost_inr=10),
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="working_professional", action_text="Volunteer with a local animal welfare NGO.", impact="high", category="volunteering", verification_method="ngo_confirmation", base_points=50, effort_hours=3, recurring=True),
    ActionDefinition(issue_id="ladakh-sixth-schedule", persona_id="citizen", action_text="File an RTI to the Ministry of Home Affairs on the status and timeline of the Centre-Ladakh dialogue.", impact="high", category="rti_grievance", verification_method="document_upload", base_points=50, effort_hours=1, cost_inr=10),
    ActionDefinition(issue_id="ladakh-sixth-schedule", persona_id="working_professional", action_text="Constitutional/legal professionals: offer pro-bono research support to advocacy groups drafting Sixth Schedule proposals.", impact="high", category="advocacy", verification_method="ngo_confirmation", base_points=50, effort_hours=4, recurring=True),
])

# ---- Actions: granular personas (software engineer, lawyer, doctor, student) --
# Written specifically per issue, not generic "volunteer" copy — matches the
# product principle that recommendations should be genuinely personalized.

db.add_all([
    # NEET-UG leak
    ActionDefinition(issue_id="neet-2026-leak", persona_id="software_engineer",
        action_text="Build or contribute to an open-source dashboard tracking RTI response times from the Ministry of Education/NTA on the leak investigation — public transparency tooling is the highest-leverage thing a technical volunteer can do here.",
        impact="high", category="advocacy", verification_method="social_post_verification", base_points=50, effort_hours=6, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="lawyer",
        action_text="Offer pro-bono consultation to students/families weighing legal action over the cancelled exam, or help draft RTI escalation requests when the Ministry/NTA stonewalls.",
        impact="high", category="rti_grievance", verification_method="ngo_confirmation", base_points=50, effort_hours=4, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="doctor",
        action_text="Volunteer clinical hours with an established helpline (iCall, Vandrevala Foundation) supporting affected students — don't DM students directly, route through the organisations already doing this safely.",
        impact="high", category="volunteering", verification_method="ngo_confirmation", base_points=50, effort_hours=3, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="student",
        action_text="Translate the verified timeline and mental-health helpline numbers into your regional language and share through student networks — English/Hindi coverage misses a large share of affected students.",
        impact="medium", category="awareness", verification_method="social_post_verification", base_points=30, effort_hours=2, recurring=False),

    # Ladakh
    ActionDefinition(issue_id="ladakh-sixth-schedule", persona_id="software_engineer",
        action_text="Offer to help the Leh Apex Body or Kargil Democratic Alliance digitize and publish primary documents (dialogue committee minutes, Sixth Schedule proposals) if they lack technical capacity — contact them directly before building anything unsolicited.",
        impact="medium", category="advocacy", verification_method="ngo_confirmation", base_points=30, effort_hours=4, recurring=False),
    ActionDefinition(issue_id="ladakh-sixth-schedule", persona_id="lawyer",
        action_text="Offer pro-bono constitutional research specifically on Sixth Schedule precedent (other tribal areas under Schedule VI) to advocacy groups drafting Ladakh's proposal.",
        impact="high", category="advocacy", verification_method="ngo_confirmation", base_points=50, effort_hours=5, recurring=True),
    ActionDefinition(issue_id="ladakh-sixth-schedule", persona_id="student",
        action_text="Translate Sixth Schedule explainer content into Ladakhi, Hindi, or other regional languages for wider local reach.",
        impact="medium", category="awareness", verification_method="social_post_verification", base_points=30, effort_hours=2, recurring=False),

    # Stray dog verdict
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="doctor",
        action_text="Veterinarians specifically: volunteer sterilisation/vaccination hours at a local ABC centre before the August 7 compliance deadline.",
        impact="high", category="volunteering", verification_method="ngo_confirmation", base_points=50, effort_hours=4, recurring=True),
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="software_engineer",
        action_text="Build a simple public tracker (even a spreadsheet + map) of which districts have published ABC centre compliance status ahead of the August 7 deadline — most citizens have no visibility into this right now.",
        impact="high", category="advocacy", verification_method="social_post_verification", base_points=50, effort_hours=5, recurring=False),
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="student",
        action_text="Volunteer at local ABC/sterilisation drives, or help translate Animal Welfare Board guidance for community awareness campaigns.",
        impact="medium", category="volunteering", verification_method="ngo_confirmation", base_points=30, effort_hours=3, recurring=True),
])

db.add(NGO(name="Blue Cross of India", darpan_id="DEMO-001", city="Chennai", verified=True, focus_areas=["animal_welfare"], website="https://www.bluecrossofindia.org"))
db.add(NGO(name="Unverified Local Shelter (example)", verified=False, city="Bengaluru"))

# ---- Version history (real, non-simulated) ------------------------------
# One "issue.created" entry per issue — this is literally what happened: the
# seed script authored and committed this content. No entry here claims an
# editorial review took place, because none has (see app/services/audit.py).
# The Ladakh flagship additionally gets one "timeline_event.added" entry per
# timeline event, since it's the reusable blueprint page and the one place
# we're demonstrating what granular, per-change history should look like.
for issue in (issue1, issue2, issue3):
    log_change(db, action="issue.created", target_type="issue", target_id=issue.id, actor_id=admin.id,
               metadata={"title": issue.title})

for ev in (
    (date(2025, 9, 24), "Protests in Ladakh turn violent; four killed."),
    (date(2025, 9, 26), "Wangchuk detained under the National Security Act."),
    (date(2026, 3, 14), "MHA revokes Wangchuk's NSA detention."),
    (date(2026, 3, 17), "Wangchuk's first public remarks after release."),
):
    log_change(db, action="timeline_event.added", target_type="issue", target_id="ladakh-sixth-schedule",
               actor_id=admin.id, metadata={"event_date": ev[0].isoformat(), "summary": ev[1]})

db.commit()
print("Seed complete: 3 issues (with full sourced timelines), 20 actions across 8 personas, 2 NGOs, 2 users (admin + demo), version history logged.")
