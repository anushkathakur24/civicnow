from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models._util import gen_uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)  # null if OAuth-only account
    google_sub = Column(String(255), unique=True, nullable=True)  # Google OAuth subject id

    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    persona_id = Column(String(50), nullable=True)
    city = Column(String(120), nullable=True)
    college = Column(String(120), nullable=True)
    company = Column(String(120), nullable=True)
    bio = Column(String(500), nullable=True)

    email_verified_at = Column(DateTime, nullable=True)
    phone_verified_at = Column(DateTime, nullable=True)

    account_status = Column(String(20), nullable=False, default="active")  # active|suspended|shadow_restricted|deleted
    role = Column(String(20), nullable=False, default="user")  # user|ngo_staff|moderator|editorial_lead|admin
    trust_tier = Column(Integer, nullable=False, default=0)

    # Privacy defaults deliberately conservative — see architecture doc Part 4/5.
    leaderboard_opt_in = Column(Boolean, nullable=False, default=False)
    show_real_name_public = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen_at = Column(DateTime, nullable=True)

    submissions = relationship("ActionSubmission", back_populates="user", foreign_keys="[ActionSubmission.user_id]")
    badges = relationship("UserBadge", back_populates="user")
    streak = relationship("Streak", back_populates="user", uselist=False)

    @property
    def is_email_verified(self) -> bool:
        return self.email_verified_at is not None

    @property
    def can_earn_points(self) -> bool:
        """Anti-fraud gate: no points count until email verified AND account >= 24h old.
        See CivicNow_Production_Architecture.md Part 3."""
        if not self.is_email_verified:
            return False
        age = datetime.now(timezone.utc) - self.created_at.replace(tzinfo=timezone.utc)
        return age.total_seconds() >= 24 * 3600


class Session(Base):
    """Refresh-token sessions, stored hashed so a DB leak doesn't equal live tokens."""
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token_hash = Column(String(255), nullable=False)
    device_fingerprint = Column(String(255), nullable=True)
    ip_created = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
