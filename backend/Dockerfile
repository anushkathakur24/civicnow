FROM python:3.11-slim AS base

# psycopg2-binary needs libpq at runtime; gcc only needed transiently for any
# source builds pip falls back to, so it's fine in a single non-multistage image
# for a small FastAPI service like this.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Migrations run as a separate release-phase step (see DEPLOYMENT.md), not on
# every container boot — running `alembic upgrade head` automatically on start
# is a common footgun with multiple replicas racing the same migration.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
