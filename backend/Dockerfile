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
RUN chmod +x entrypoint.sh

RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# entrypoint.sh runs migrations + demo seed (both idempotent, safe on every
# boot) before starting uvicorn. This used to be a separate release-phase
# step configured on the hosting platform, but that turned out to be
# unreliable across providers (Render's free tier locks the Pre-Deploy
# Command field behind a paid plan; its Docker Command override field
# doesn't parse `&&` typed into a web form). Baking it into the image
# means no extra platform configuration is required anywhere it's deployed.
# On a multi-replica production setup, prefer a real release-phase hook
# instead so N replicas don't all race the same migration on boot — fine
# for this project's current single-instance scale.
CMD ["./entrypoint.sh"]
