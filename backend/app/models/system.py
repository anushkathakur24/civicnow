from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, JSON, BigInteger

from app.db.session import Base
from app.models._util import gen_uuid


class AuditLog(Base):
    """Append-only (enforced at the DB-role grant level in production Postgres —
    see Production Architecture Part 2/13). Never updated or deleted from the app."""
    __tablename__ = "audit_log"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g. 'score.clawback', 'issue.publish'
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(100), nullable=True)
    log_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ModerationQueueItem(Base):
    __tablename__ = "moderation_queue"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    item_type = Column(String(50), nullable=False)  # ngo_verification|issue_edit|action_submission|user_report
    item_id = Column(String(100), nullable=False)
    status = Column(String(20), default="open")  # open|in_review|resolved|appealed
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
