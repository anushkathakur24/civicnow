"""Seed demo data: the 3 CivicNow issues + actions + a demo admin and demo user.
Run with: DATABASE_URL=... python3 scripts/seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timedelta, timezone
from app.db.session import SessionLocal, engine, Base
from app import models
from app.models.civic import Issue, TimelineEvent, Promise, Source, ResponsibleBody, ActionDefinition, NGO
from app.models.user import User
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)  # no-op if Alembic already ran; safe for fresh sandbox/CI DBs
db = SessionLocal()

if db.query(Issue).count() > 0:
    print("Already seeded — skipping.")
    raise SystemExit(0)

issue1 = Issue(
    id="neet-2026-leak", title="NEET-UG 2026 Paper Leak & Accountability Crisis",
    category="Education / Exam Integrity", urgency="critical", status="ongoing",
    summary="NEET-UG 2026 was cancelled after evidence of a widespread paper leak. Multiple student suicides followed, fuelling nationwide protests.",
    current_ask="CJP and allied protesters are demanding Education Minister Dharmendra Pradhan's resignation and systemic NTA reform.",
    accountability_mechanism="Public Examinations (Prevention of Unfair Means) Act, 2024.",
    sensitive_note="Involves student suicides and an active hunger strike. iCall: 9152987821 · Vandrevala Foundation: 1860-2662-345.",
    published=True,
)
issue2 = Issue(
    id="ladakh-sixth-schedule", title="Ladakh Statehood & Sixth Schedule Movement",
    category="Governance / Constitutional Rights", urgency="high", status="in negotiation",
    summary="Movement for statehood and/or Sixth Schedule protections for Ladakh, led by the Leh Apex Body and Kargil Democratic Alliance.",
    current_ask="Sixth Schedule protections and/or statehood restoration for Ladakh.",
    accountability_mechanism="Centre-Ladakh dialogue committee outcomes; related Supreme Court case.",
    published=True,
)
issue3 = Issue(
    id="sc-stray-dog-verdict", title="Supreme Court Stray Dog Verdict — Municipal Compliance Tracker",
    category="Public Safety / Animal Welfare", urgency="medium", status="compliance deadline approaching",
    summary="Supreme Court ordered ABC centres in every district; compliance affidavits due Aug 7, 2026.",
    current_ask="Push your municipal body to publish ABC centre compliance status.",
    accountability_mechanism="Contempt-of-court exposure for non-compliant municipal bodies.",
    published=True,
)
db.add_all([issue1, issue2, issue3])
db.flush()

db.add_all([
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,5,3), event_text="NEET-UG 2026 held; leak surfaces shortly after.", verified=True),
    TimelineEvent(issue_id="neet-2026-leak", event_date=date(2026,6,28), event_text="Sonam Wangchuk begins hunger strike in solidarity.", verified=True),
    Promise(issue_id="neet-2026-leak", made_by="Education Ministry", promise_text="Cancel and re-conduct the compromised exam", status="kept"),
    Promise(issue_id="neet-2026-leak", made_by="Education Ministry", promise_text="Education Minister resignation", status="pending"),
    Source(issue_id="neet-2026-leak", title="Al Jazeera coverage", url="https://www.aljazeera.com/news/2026/7/14/indian-activist-wangchuk-urged-to-end-hunger-strike-over-exam-paper-leaks"),
    ResponsibleBody(issue_id="neet-2026-leak", body_name="National Testing Agency (NTA)"),
    ResponsibleBody(issue_id="neet-2026-leak", body_name="Ministry of Education"),
])

db.add_all([
    ActionDefinition(issue_id="neet-2026-leak", persona_id="citizen", action_text="File an RTI to the Ministry of Education / NTA on leak investigation status.", impact="high", category="rti_grievance", verification_method="document_upload", base_points=50, effort_hours=1, cost_inr=10, recurring=False),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="citizen", action_text="Verify and share only sourced information.", impact="medium", category="awareness", verification_method="self_reported", base_points=30, effort_hours=1, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="content_creator", action_text="Publish a fact-checked explainer using the verified timeline.", impact="high", category="awareness", verification_method="social_post_verification", base_points=50, effort_hours=3, recurring=True),
    ActionDefinition(issue_id="neet-2026-leak", persona_id="working_professional", action_text="Donate to a vetted student legal-aid fund.", impact="medium", category="donation", verification_method="receipt_upload", base_points=30, cost_inr=500, recurring=False),
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="citizen", action_text="File an RTI on your district's ABC centre status.", impact="high", category="rti_grievance", verification_method="document_upload", base_points=50, effort_hours=1, cost_inr=10),
    ActionDefinition(issue_id="sc-stray-dog-verdict", persona_id="working_professional", action_text="Volunteer with a local animal welfare NGO.", impact="high", category="volunteering", verification_method="ngo_confirmation", base_points=50, effort_hours=3, recurring=True),
])

db.add(NGO(name="Blue Cross of India", darpan_id="DEMO-001", city="Chennai", verified=True, focus_areas=["animal_welfare"]))
db.add(NGO(name="Unverified Local Shelter (example)", verified=False, city="Bengaluru"))

# Backdated created_at so the demo account clears the 24h anti-fraud gate
# immediately (see User.can_earn_points) — real user accounts get this
# naturally by just... existing for a day. This is a demo-data convenience only.
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

db.commit()
print("Seed complete: 3 issues, 6 actions, 2 NGOs, 2 users (admin + demo).")
