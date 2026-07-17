from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship

from app.db.session import Base


class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    label = Column(String(120), nullable=False)
    criteria = Column(JSON, nullable=True)


class UserBadge(Base):
    __tablename__ = "user_badges"
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), primary_key=True)
    awarded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="badges")


class Streak(Base):
    __tablename__ = "streaks"
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    freeze_tokens = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="streak")


class Follow(Base):
    __tablename__ = "follows"
    follower_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    followee_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
