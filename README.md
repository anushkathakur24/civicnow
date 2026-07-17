# CivicNow

India's civic action platform — track urgent civic issues, take verified action matched to your role, and build a fraud-resistant Impact Score for what you actually do.

This is the production application: a FastAPI backend with real auth and server-side-only scoring, and a Next.js frontend. It supersedes the earlier static prototype in `civic-hub/` (kept for reference — see its own README for how it relates).

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript), Tailwind CSS, framer-motion |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Database | PostgreSQL in production (Neon/Supabase); SQLite for local/sandbox/CI |
| Auth | JWT bearer tokens, bcrypt password hashing |
| Deploy targets | Frontend to Vercel, Backend to Render/Railway, DB to Neon/Supabase |
| CI | GitHub Actions (lint + test + build on every push/PR) |

## Repository layout

```
app/
├── backend/          FastAPI service
│   ├── app/
│   │   ├── api/v1/routers/   auth, issues, actions, users, leaderboard, ngos, health
│   │   ├── core/              config, security (JWT/bcrypt), logging
│   │   ├── db/                SQLAlchemy session/engine
│   │   ├── models/            User, Issue, ActionDefinition, ActionSubmission, NGO, ...
│   │   ├── schemas/           Pydantic request/response models
│   │   └── services/scoring.py   the entire Impact Score algorithm, server-side only
│   ├── alembic/               migrations
│   ├── scripts/seed.py        demo data (3 issues, 6 actions, 2 NGOs, admin + demo user)
│   ├── tests/                 pytest: auth, actions/scoring, health
│   └── Dockerfile
├── frontend/          Next.js app
│   ├── app/                   pages: home, issues/[id], login, register, profile, leaderboard, ngos
│   ├── components/            NavBar, IssueCard, RandomLetterSwap, ProtectedRoute, ...
│   ├── lib/                   api.ts (typed fetch client), auth.tsx (auth context)
│   └── Dockerfile
├── docker-compose.yml  local dev stack (Postgres + backend + frontend)
├── .github/workflows/ci.yml
├── DEPLOYMENT.md       exact steps to deploy to Vercel/Render/Neon
├── ARCHITECTURE.md     system diagram + data flow
└── PRODUCTION_CHECKLIST.md
```

## Run locally

**Fastest path, Docker:**

```bash
cd app
docker compose up --build
```

Frontend at `http://localhost:3000`, backend at `http://localhost:8000` (docs at `/docs` in non-production `ENV`). The backend container runs migrations and seeds demo data automatically on first boot.

**Without Docker:**

```bash
# Backend
cd app/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # defaults to SQLite, fine for local dev
alembic upgrade head
python3 scripts/seed.py
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd app/frontend
npm install
cp .env.example .env.local
npm run dev
```

## Demo credentials (seeded by `scripts/seed.py`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@civicnow.demo` | `DemoAdmin!2026` |
| Demo citizen | `demo@civicnow.demo` | `DemoUser!2026` |

These exist only in seeded dev/demo databases. Never run `seed.py` against a real production database — see `PRODUCTION_CHECKLIST.md`.

## Tests

```bash
cd app/backend
pytest tests/ -v          # 9 tests: health, auth, scoring/idempotency

cd app/frontend
npm run lint && npm run build   # type-checks + production build
```

Both were run and verified passing in the build sandbox: 9/9 backend tests, clean `ruff check`, clean `next lint`, clean `next build`, and a live end-to-end smoke test (register → login → view issue → check Impact Score) against a real SQLite-backed server.

## Deploying

See `DEPLOYMENT.md` for the exact, step-by-step path to a public URL (Vercel + Render + Neon), including which steps require you personally to create third-party accounts. A Claude session cannot register a Vercel, Render, or Neon account, create a Google OAuth client, or create a Sentry project on your behalf — those steps are called out explicitly.
