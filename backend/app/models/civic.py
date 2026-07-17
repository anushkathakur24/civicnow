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
    published = Column(Boolean, nullable=False, default=False)  # gated behind editorial review
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    timeline = relationship("TimelineEvent", back_populates="issue", order_by="TimelineEvent.event_date")
    promises = relationship("Promise", back_populates="issue")
    sources = relationship("Source", back_populates="issue")
    responsible_bodies = relationship("ResponsibleBody", back_populates="issue")
    actions = relationship("ActionDefinition", back_populates="issue")


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


class ResponsibleBody(Base):
    __tablename__ = "issue_responsible_bodies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(80), ForeignKey("issues.id", ondelete="CASCADE"), index=True)
    body_name = Column(String(255), nullable=False)
    issue = relationship("Issue", back_populates="responsible_bodies")


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

    issue = relationship("Issue", back_populates="actions")

    __table_args__ = (Index("ix_action_issue_persona", "issue_id", "persona_id"),)


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
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class NGOStaff(Base):
    __tablename__ = "ngo_staff"
    ngo_id = Column(String(36), ForeignKey("ngos.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(30), default="staff")
