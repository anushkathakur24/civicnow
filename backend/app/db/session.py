"""Engine/session setup.

Portable across SQLite (local sandbox / CI testing, no server process needed)
and PostgreSQL (production — Neon/Supabase). Models deliberately avoid
Postgres-only column types (native UUID, ARRAY) so the same models produce
correct DDL on both engines via Alembic. Point DATABASE_URL at Postgres in
production; nothing else changes.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
pool_kwargs = {} if settings.DATABASE_URL.startswith("sqlite") else {
    "pool_size": 10,
    "max_overflow": 20,
    "pool_pre_ping": True,   # avoids stale-connection errors after DB idle/restart
    "pool_recycle": 1800,
}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, **pool_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
