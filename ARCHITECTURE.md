# CivicNow — Architecture

## System diagram

```
                    ┌─────────────────────┐
                    │      Browser         │
                    │  (citizen, NGO staff, │
                    │   official, creator)  │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │  Next.js frontend     │
                    │  (Vercel)             │
                    │  - App Router pages   │
                    │  - Server components  │
                    │    fetch issues/leader-│
                    │    board at request/   │
                    │    ISR time            │
                    │  - Client components  │
                    │    call the API        │
                    │    directly (JWT in    │
                    │    Authorization header)│
                    └──────────┬───────────┘
                               │ HTTPS + CORS
                               ▼
                    ┌─────────────────────┐
                    │  FastAPI backend      │
                    │  (Render/Railway)      │
                    │  - /api/v1/auth        │
                    │  - /api/v1/issues      │
                    │  - /api/v1/actions     │
                    │  - /api/v1/leaderboard │
                    │  - /api/v1/ngos        │
                    │  - /api/v1/health(/db) │
                    │  - rate limiting        │
                    │  - structured errors    │
                    │  - Sentry (optional)    │
                    └──────────┬───────────┘
                               │ SQLAlchemy (pooled)
                               ▼
                    ┌─────────────────────┐
                    │  PostgreSQL            │
                    │  (Neon / Supabase)     │
                    │  - users, sessions      │
                    │  - issues, actions,     │
                    │    submissions          │
                    │  - audit_log,           │
                    │    moderation_queue     │
                    └─────────────────────┘

  Cross-cutting:
  - GitHub Actions CI: lint + test + build on every push/PR to main
  - Vercel / Render auto-deploy from `main` on their own push hooks
  - Sentry: error reporting (both frontend and backend, DSN via env var)
```

## Why this shape

**Server-side-only scoring.** The single non-negotiable constraint from the CTO review (`civic-hub/CivicNow_Production_Architecture.md`) was: Impact Score must never be trusted from the client. The frontend never computes, stores, or submits a score — it only submits *evidence of an action*, and `app/services/scoring.py` alone decides how many points that's worth, using a trust-multiplier table keyed by verification method (self-report = 0.2x, NGO-confirmed = 1.0x, etc.) plus a diminishing-returns rule against repeat submissions in the same category within 7 days.

**Idempotency over optimistic retries.** `ActionSubmission` is keyed by `(user_id, idempotency_key)`. A retried request (flaky mobile network, double-tap) returns the original submission instead of creating a second one — verified by `test_idempotent_submission_does_not_double_award`.

**Auto-approve only the lowest-trust tier.** `self_reported` actions auto-approve (and are worth the least). Everything else — RTI filings, NGO-confirmed volunteering, government verification — sits in `pending` until a moderator/NGO staffer/official calls `POST /actions/{id}/verify`. This is the main lever against Sybil/farming abuse at launch scale.

**24-hour + email-verified gate before any points.** `User.can_earn_points` blocks scoring for unverified or brand-new accounts — closes the "spin up 500 accounts, self-report 500 times" exploit.

**Portable models, not portable illusions.** Models use `String(36)` UUIDs and a generic JSON column type so the *same* SQLAlchemy models run against SQLite (sandbox/CI/local) and Postgres (production) without code branches. This was a deliberate choice so the test suite in CI doesn't need a live Postgres instance, while production still gets real Postgres guarantees.

**Live aggregation now, materialized view later.** `/leaderboard` currently aggregates `SUM(points_awarded)` per request. That's correct and fine at hundreds of users; the code has an explicit comment flagging that past ~100k submissions this must move to a materialized view refreshed on a cron, per Production Architecture Part 2/4. Do not scale-test this endpoint and be surprised.

## Data model (backend/alembic — 18 tables)

`users`, `sessions`, `issues`, `timeline_events`, `promises`, `sources`, `responsible_bodies`, `action_definitions`, `action_submissions`, `ngos`, `ngo_staff`, `badges`, `user_badges`, `streaks`, `follows`, `audit_log`, `moderation_queue_items`, plus Alembic's own `alembic_version`.

## Known scale limits (intentional, documented, not hidden)

- Leaderboard: live aggregation, not materialized — fine to ~10k active scorers, revisit before that.
- No caching layer (Redis) yet — every request hits Postgres directly. Fine at launch traffic; add read-through caching for `/issues` and `/leaderboard` before any viral spike.
- No background job runner (Celery/RQ) — verification, badge awarding, and streak updates all happen synchronously in the request. Fine for launch; move to async workers if `/actions/submit` latency becomes visible.
- Google OAuth is stubbed (`501 Not Implemented`) until `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set — see DEPLOYMENT.md.
