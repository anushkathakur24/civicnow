#!/bin/sh
# Baked into the image's CMD instead of relying on a hosting platform's
# "start command" / "pre-deploy command" web field. Those fields (Render's
# free tier locks Pre-Deploy Command behind a paid plan, and its Docker
# Command field doesn't reliably parse shell operators like `&&` typed into
# a web form) turned out to be fragile in practice. Doing it here means
# `docker run` / Render / Railway / anything just needs to start the
# container — no extra platform-specific configuration required.
#
# Both steps are safe to re-run on every boot:
#   - `alembic upgrade head` no-ops once the DB is already at head
#   - `scripts/seed.py` checks for existing rows and skips itself if seeded
set -e

echo "Running migrations..."
alembic upgrade head

echo "Seeding demo data (no-ops if already seeded)..."
python scripts/seed.py

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers "${WEB_CONCURRENCY:-2}"
