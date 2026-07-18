from datetime import datetime, timezone

from sqlalchemy import (Boolean, Column, DateTime, Date, ForeignKey, Integer,
                          Numeric, String, Text, JSON, UniqueConstraint, Index)
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models._util import gen_uuid


class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(80), primary_key=True)  # slug, e.g. 'neet-2026-leak'
    title = Column(String(255), nullable=False)
    category = Column(String(120), nullable=False)
    urgency = Column(String(20), nullable=False)  # critical|high|medium|low
    status = Column(String(120), nullable=False)
    summary = Column(Text, nullable=False)
    current_ask = Column(Text, nullable=True)
    accountability_mechanism = Column(Text, nullable=True)
    sensitive_note = Column(Text, nullable=True)
    # `sensitive_content` is the actual gate for the standardized "Need
    # support?" callout — deliberately separate from `sensitive_note` (which
    # stays available for free-text context, e.g. "this involves an active
    # hunger strike") because the callout itself now renders from a single
    # shared helpline dataset, not per-issue-authored text. `support_note_visible`
    # is a distinct editorial on/off switch: an issue can genuinely involve
    # distressing subject matter (`sensitive_content=True`) while an editor
    # still explicitly suppresses the box for some documented reason — both
    # flags must be true for the box to render, so the default (True) never
    # silently hides it without someone deliberately flipping it off.
    sensitive_content = Column(Boolean, nullable=False, default=False)
    support_note_visible = Column(Boolean, nullable=False, default=True)
    published = Column(Boolean, nullable=False, default=False)  # gated behind editorial review
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    # Distinct from `updated_at`, which changes on ANY row write (including
    # unrelated edits). `last_fact_checked_at` only changes when someone
    # deliberately re-verifies the underlying facts/sources are still
    # accurate — set manually, never auto-updated, so it stays honest about
    # what it claims.
    last_fact_checked_at = Column(DateTime, nullable=True)

    timeline = relationship("TimelineEvent", back_populates="issue", order_by="TimelineEvent.event_date")
    promises = relationship("Promise", back_populates="issue")
    sources = relationship("Source", back_populates="issue")
    responsible_bodies = relationship("ResponsibleBody", back_populates="issue")
    actions = relationship("ActionDefinition", back_populates="issue")
    help_actions = relationship("HelpAction", back_populates="issue", order_by="HelpAction.sort_order")


class TimelineEvent(Base):
    __tablename__ = "issue_timeline_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    event_date = Column(Date, nullable=False)
    event_text = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    verified = Column(Boolean, default=False)
    issue = relationship("Issue", back_populates="timeline")


class Promise(Base):
    __tablename__ = "promises"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    made_by = Column(String(255), nullable=False)
    promise_text = Column(Text, nullable=False)
    promised_date = Column(Date, nullable=True)
    deadline_date = Column(Date, nullable=True)
    status = Column(String(20), default="pending")  # pending|kept|broken|partial|unclear
    source_url = Column(String(500), nullable=True)
    issue = relationship("Issue", back_populates="promises")


class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(500), nullable=False)
    issue = relationship("Issue", back_populates="sources")


class GovernmentBody(Base):
    """A reusable stakeholder/institution entity (ministry, court, UT administration,
    civil society group, etc.) — normalized so the same organization can be referenced
    across multiple issues instead of re-typing its name as a bare string each time.
    Added alongside the pre-existing `body_name` text field on ResponsibleBody rather
    than replacing it, so already-seeded production rows keep working unmodified
    while new/updated stakeholder data links to a real record with a description
    and website."""
    __tablename__ = "government_bodies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    body_type = Column(String(50), nullable=False)
    # ministry | court | ut_administration | constitutional_body |
    # civil_society_group | investigative_agency
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ResponsibleBody(Base):
    __tablename__ = "issue_responsible_bodies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    body_name = Column(String(255), nullable=False)
    government_body_id = Column(String(36), ForeignKey("government_bodies.id"), nullable=True)
    issue = relationship("Issue", back_populates="responsible_bodies")
    government_body = relationship("GovernmentBody")


class ActionDefinition(Base):
    """A recommend-able action for a given issue x persona. Seed data; editorially curated."""
    __tablename__ = "action_definitions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    persona_id = Column(String(50), nullable=False)
    action_text = Column(Text, nullable=False)
    impact = Column(String(10), nullable=False)  # high|medium|low
    category = Column(String(30), nullable=False)  # awareness|volunteering|rti_grievance|donation|advocacy
    verification_method = Column(String(30), nullable=False, default="self_reported")
    base_points = Column(Integer, nullable=False, default=15)
    effort_hours = Column(Numeric, nullable=True)
    cost_inr = Column(Numeric, nullable=True)
    recurring = Column(Boolean, default=False)
    remote_or_in_person = Column(String(20), nullable=True)  # remote|in_person|either
    required_skills = Column(JSON, nullable=True)  # list[str], e.g. ["Python", "data visualization"]

    issue = relationship("Issue", back_populates="actions")

    __table_args__ = (Index("ix_action_issue_persona", "issue_id", "persona_id"),)


class HelpAction(Base):
    """The general, issue-level 'how you can help' layer — grounded, sourced,
    concrete actions anyone can take (amplify, sign a real petition, contact a
    named representative, show up somewhere specific), distinct from
    ActionDefinition (the role-matched/persona layer with points and
    verification). Both render on the issue page; they are never merged into
    one list because they serve different jobs — see issue-authoring
    checklist in backend/CONTENT_GUIDELINES.md.

    Every row here must be backed by at least one real, checkable source_url —
    this is content-authoring policy, enforced by the seed-data assertion at
    the bottom of scripts/seed.py and by the authoring checklist, not by a DB
    constraint (a URL's realness isn't something the database can verify)."""
    __tablename__ = "issue_help_actions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    action_type = Column(String(30), nullable=False)  # amplify|petition|contact|physical|donate|volunteer|monitor
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    source_urls = Column(JSON, nullable=False)  # list[str], 1+ required — see class docstring
    last_verified = Column(Date, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    # Ongoing situations (a hunger strike, a live petition) change quickly.
    # Rather than leaving a stale action live with outdated urgency, an
    # editor flips this to False when re-verifying finds it's no longer
    # current — the row stays in history (for the audit trail) but the API
    # excludes it from what's shown by default. See get_issue_help_actions.
    still_active = Column(Boolean, nullable=False, default=True)

    issue = relationship("Issue", back_populates="help_actions")

    __table_args__ = (Index("ix_help_action_issue", "issue_id"),)


class ActionSubmission(Base):
    """Append-only. Score is ALWAYS derived from these rows — never a mutable column
    a client can write to. See Production Architecture Part 3/13."""
    __tablename__ = "action_submissions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    action_definition_id = Column(Integer, ForeignKey("action_definitions.id"), nullable=False)
    idempotency_key = Column(String(100), nullable=False)  # client-generated, prevents double-submit points
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verification_state = Column(String(20), nullable=False, default="pending")
    # pending|auto_approved|verified|rejected|clawed_back
    trust_multiplier = Column(Numeric, nullable=False, default=0.2)
    points_awarded = Column(Integer, nullable=False, default=0)
    evidence_url = Column(String(500), nullable=True)
    reference_number = Column(String(120), nullable=True)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    ip_submitted = Column(String(64), nullable=True)

    user = relationship("User", back_populates="submissions", foreign_keys=[user_id])

    __table_args__ = (
        UniqueConstraint("user_id", "idempotency_key", name="uq_submission_idempotency"),
        Index("ix_submissions_pending", "verification_state"),
    )


class NGO(Base):
    __tablename__ = "ngos"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    darpan_id = Column(String(50), nullable=True)
    registration_doc_url = Column(String(500), nullable=True)
    focus_areas = Column(JSON, nullable=True)  # list[str]
    city = Column(String(120), nullable=True)
    website = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)  # collected at application time so a real human can follow up
    application_message = Column(Text, nullable=True)  # what the applicant told us about their org, for manual review
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class NGOStaff(Base):
    __tablename__ = "ngo_staff"
    ngo_id = Column(String(36), ForeignKey("ngos.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(30), default="staff")
