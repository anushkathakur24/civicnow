# CivicNow — Production Checklist

Status as of this build. Checked items were verified directly (tests run, commands executed, output inspected) in the build sandbox — not assumed.

## Code quality

- [x] Backend: `ruff check app` — clean, zero errors
- [x] Backend: `pytest tests/` — 9/9 passing (health, auth register/login/duplicate-email/weak-password/unauthorized, action-scoring server-side-only, idempotent-submission)
- [x] Frontend: `next lint` — clean, zero warnings
- [x] Frontend: `next build` — succeeds, all 9 routes compile, static pages prerendered
- [x] Frontend: TypeScript strict mode enabled, zero type errors
- [x] End-to-end smoke test run locally: register → login → fetch issue detail → view Impact Score, against a live SQLite-backed server and a production Next.js build, over real HTTP

## Security

- [x] Passwords hashed with bcrypt (never stored or logged in plaintext)
- [x] JWT auth on all mutating/private endpoints (`get_current_user` dependency)
- [x] Rate limiting configured (slowapi) — default + stricter write limits
- [x] CORS explicitly allowlisted via `CORS_ORIGINS`, not wildcard
- [x] Structured exception handlers — no stack traces ever returned to the client
- [x] Security headers set (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) via `next.config.js`
- [x] No secrets committed to the repo — `.env` is gitignored in both `backend/` and `frontend/`, only `.env.example` templates are committed
- [ ] **You must generate a real `JWT_SECRET`** with `openssl rand -hex 32` before deploying — the value in `.env.example` is a placeholder and must never be used in production
- [ ] **You must enable HTTPS** — handled automatically by Vercel and Render, nothing to configure, but confirm it after first deploy
- [ ] Email verification flow (send-a-real-email) is not implemented — `email_verified_at` is set to `NULL` at registration and gates scoring; wiring an actual email provider (SES/Postmark/Resend) is a follow-up, not done in this build
- [ ] CSRF: not applicable in its usual form since this is a stateless bearer-token API (no cookies, no session-based auth) — if you ever switch to httpOnly cookie sessions, CSRF protection must be added at that point

## Fraud resistance (the core design constraint of this project)

- [x] Impact Score computed and stored server-side only — verified by `test_score_cannot_be_set_by_client`, and by inspection: no endpoint anywhere accepts a client-supplied score/points value
- [x] Idempotency keys prevent duplicate-submission point-stacking — verified by `test_idempotent_submission_does_not_double_award`
- [x] New accounts cannot earn points for 24 hours + until email-verified (`User.can_earn_points`)
- [x] Trust-tiered verification: only `self_reported` actions auto-approve; everything else requires moderator/NGO/government sign-off before points are awarded
- [x] Diminishing returns on repeat same-category actions within a 7-day window (3rd+ submission = 10% value)
- [ ] Moderator/NGO-staff review UI is not built — `POST /actions/{id}/verify` exists and works (tested via curl during development) but there's no frontend page for reviewers yet; they'd need to call the API directly or you'd build an admin page as a follow-up

## Infrastructure

- [x] Dockerfiles for both services, multi-stage where it matters (frontend), non-root user, health checks
- [x] `docker-compose.yml` for local dev — Postgres + backend + frontend, migrations + seed run automatically
- [x] GitHub Actions CI (`ci.yml`) — lint + test + build on every push/PR to `main`, for both services independently
- [ ] Docker images were **not** build-tested in this sandbox (no Docker daemon available here) — they will build on your machine or in GitHub Actions' runners, which do have Docker; verify with `docker compose up --build` before first deploy
- [ ] Actual deploy to Vercel/Render/Neon was **not** performed — this requires accounts only you can create (see DEPLOYMENT.md)

## Performance / SEO

- [x] `app/sitemap.ts` and `app/robots.ts` — generate real `/sitemap.xml` and `/robots.txt`, verified via curl
- [x] Per-page metadata (title templates, OpenGraph, Twitter cards) via Next.js Metadata API, including dynamic per-issue metadata
- [x] ISR (`revalidate`) on issue list, issue detail, leaderboard, NGO list — avoids hammering the API on every request
- [x] `next.config.js`: response compression enabled, remote image optimization allowlisted
- [ ] Lighthouse score not measured — no live URL to test against yet; run `npx lighthouse https://<your-url> --view` after deploying, target is >90 across categories per the original spec

## Monitoring

- [x] `/api/v1/health` (liveness) and `/api/v1/health/db` (readiness, actually queries Postgres) implemented and verified
- [x] Structured logging (`app/core/logging_config.py`) — JSON-ish structured logs with `extra={}` context on key events (registration, submissions)
- [x] Sentry wiring is present in `app/main.py` (`if settings.SENTRY_DSN: sentry_sdk.init(...)`) — activates automatically once you set the env var, no code change needed
- [ ] Sentry DSN not configured (requires your own Sentry account — see DEPLOYMENT.md step 6)
- [ ] No uptime monitor configured (e.g. UptimeRobot/Better Uptime pinging `/api/v1/health`) — recommended, five-minute setup, requires your own account

## What's genuinely not done (be honest about this)

- Google OAuth: stubbed, returns `501` with clear instructions, not implemented — needs your Google Cloud OAuth client (DEPLOYMENT.md step 5)
- Transactional email (verification emails, notifications): not implemented at all
- Moderator/admin review dashboard: backend endpoint exists and works, no frontend UI
- Leaderboard materialized view: uses live aggregation, documented as a scale limit not yet hit
- Redis caching / background job queue: not present, not yet needed at launch scale, documented in ARCHITECTURE.md
- Load testing: not performed — no claim is made here about capacity beyond "the code is not doing anything obviously O(n²) or unbounded"
