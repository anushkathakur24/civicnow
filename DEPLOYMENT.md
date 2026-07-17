# CivicNow — Deployment Guide

This walks through taking CivicNow from this repo to a public URL: **Neon (Postgres) → Render (API) → Vercel (frontend)**, wired together with GitHub Actions CI.

**Important, read this first:** every step below that needs a third-party account (Neon, Render, Vercel, Google Cloud, Sentry) has to be done by you, personally, in your own browser. Nothing in this repo can create those accounts, click "New Project," or copy an API key on your behalf — that's true of any AI coding assistant, not a limitation specific to this session. What this repo *does* give you is code that's already been verified to build, lint, and pass its test suite, so the steps below are "click through a form and paste a value," not "debug why the app doesn't start."

## 0. Prerequisites

- A GitHub account.
- Accounts (free tiers are enough to launch): [Neon](https://neon.tech) or [Supabase](https://supabase.com), [Render](https://render.com) or [Railway](https://railway.app), [Vercel](https://vercel.com).

## 1. Push this project to GitHub

This folder (`civic-hub/app/`) is meant to be its own git repository — Render and Vercel will each point at it and treat `backend/` and `frontend/` as subfolders of the repo root.

1. Create a new, empty repository on GitHub (github.com → New repository). Don't initialize it with a README/`.gitignore`/license — this folder already has those. Note the URL it gives you, e.g. `https://github.com/<you>/civicnow.git`.
2. From your machine, open a terminal in this folder and run:

   ```bash
   cd path/to/speakUp/civic-hub/app
   git init
   git add .
   git commit -m "CivicNow: FastAPI backend + Next.js frontend"
   git branch -M main
   git remote add origin https://github.com/<you>/civicnow.git
   git push -u origin main
   ```

3. Sanity-check on GitHub afterward that `.env` files did **not** get pushed (only `.env.example` should appear) — the `.gitignore` in this folder already excludes them, but it's worth a look before you wire up Render/Vercel.
4. If `git` asks you to log in, GitHub no longer accepts your account password for this — use a [personal access token](https://github.com/settings/tokens) as the password, or authenticate via `gh auth login` if you have the [GitHub CLI](https://cli.github.com) installed.

From here on, "your GitHub repo" means this one.

## 2. Database — Neon (or Supabase)

1. Create a Neon project. Note the connection string it gives you — it looks like:
   `postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require`
2. SQLAlchemy needs the `+psycopg2` driver marker. Rewrite it to:
   `postgresql+psycopg2://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require`
   This is your `DATABASE_URL`.
3. Keep this tab open — you'll paste this value into Render in step 3.

(Supabase: same idea, connection string is under Project Settings → Database → Connection string → URI, adjusted the same way.)

## 3. Backend — Render (or Railway)

1. New → Web Service → connect your GitHub repo → set **Root Directory** to `backend`.
2. Runtime: Docker (it will pick up `backend/Dockerfile` automatically).
3. Environment variables (Render dashboard → Environment):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `JWT_SECRET` | generate with `openssl rand -hex 32` — **do not reuse the value in `.env.example`** |
   | `JWT_ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
   | `CORS_ORIGINS` | your Vercel URL, e.g. `https://civicnow.vercel.app` (add it after step 3 — you can redeploy env vars any time) |
   | `ENV` | `production` |
   | `RATE_LIMIT_DEFAULT` | `100/minute` |
   | `RATE_LIMIT_WRITE` | `20/minute` |
   | `SENTRY_DSN` | *(optional, see step 5)* |

4. Add a **Release Command** (Render: Settings → Release Command) so migrations run once per deploy, not once per replica boot:
   ```
   alembic upgrade head
   ```
5. First deploy only — seed demo data via Render's shell tab:
   ```
   python scripts/seed.py
   ```
   Skip this on a real production launch once you have real users; it's for demoing the platform, not for a live database with real accounts.
6. Health check path (Render → Settings → Health Check Path): `/api/v1/health`
7. Deploy. Confirm `https://<your-service>.onrender.com/api/v1/health` returns `{"status":"ok"}` and `/api/v1/health/db` returns `{"status":"ok","database":"reachable"}`.
8. Note the backend's public URL — you need it for step 4.

## 4. Frontend — Vercel

1. New Project → import the same GitHub repo → set **Root Directory** to `frontend`. Vercel auto-detects Next.js.
2. Environment variables (Vercel dashboard → Settings → Environment Variables), for Production, Preview, and Development:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-backend>.onrender.com/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://civicnow.vercel.app` |

3. Deploy. Vercel gives you a `https://<project>.vercel.app` URL immediately, plus a free custom domain slot if you own one (Settings → Domains).
4. Go back to Render (step 3.3) and set `CORS_ORIGINS` to this exact URL (no trailing slash), then redeploy the backend. Until you do this, browser requests from the frontend to the API will be blocked by CORS — this is expected and correct, not a bug.

## 5. Auto-deploy on push

Both Vercel and Render watch your GitHub repo natively — pushing to `main` triggers a new deploy on each automatically, no extra config needed. `.github/workflows/ci.yml` runs lint + test + build on every push/PR to `main` as a **gate you can look at**, not as the thing that triggers deployment. If you'd rather have GitHub Actions itself trigger deploys (e.g. to require CI to pass before a deploy even starts), see the comment block in `deploy-gate` inside that workflow file — it explains the two remaining CLI calls and which repo secrets they need, deliberately left out because those secrets belong to your hosting accounts.

**Rollback on failure:** both Vercel and Render keep every previous deploy and offer one-click rollback in their dashboards (Vercel: Deployments tab → "..." → Promote to Production; Render: Events tab → Rollback). Because CI runs *before* either platform's deploy hook fires (they watch the same push, but Actions and the platform build run in parallel, not sequentially), a genuine one-click "roll back automatically if CI fails" wire-up requires the explicit CLI-deploy setup mentioned above.

## 6. Optional: Google OAuth

`GET /api/v1/auth/google/login` currently returns `501 Not Implemented` with an explanatory message. To enable it:

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth Client ID (type: Web application).
2. Authorized redirect URI: `https://<your-backend>.onrender.com/api/v1/auth/google/callback`
3. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` on Render.
4. This requires implementing the `/google/callback` handler using `authlib` (already in `requirements.txt`) — the stub in `backend/app/api/v1/routers/auth.py` documents exactly what it needs to do (exchange code, look up-or-create by `google_sub`, issue the same JWT the password flow issues).

## 7. Optional: Sentry

1. [sentry.io](https://sentry.io) → New Project → Python (FastAPI) and, separately, a JavaScript (Next.js) project.
2. Set `SENTRY_DSN` on Render for the backend. `backend/app/main.py` already initializes it if the var is present — no code change needed.
3. For the frontend, add `@sentry/nextjs` (`npx @sentry/wizard@latest -i nextjs` from `frontend/`) and set the DSN Vercel gives you as an env var — not pre-wired in this repo since it requires your actual DSN to configure correctly.

## 8. Custom domain

Both Vercel and Render support custom domains on free/low tiers. Point your domain's DNS at Vercel for the frontend (`civicnow.example.com`) and optionally a subdomain at Render for the API (`api.civicnow.example.com`), then update `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS` to match.

## Verifying the deploy

```bash
curl https://<your-backend>.onrender.com/api/v1/health
curl https://<your-backend>.onrender.com/api/v1/health/db
curl https://<your-backend>.onrender.com/api/v1/issues
curl https://<your-frontend>.vercel.app/
curl https://<your-frontend>.vercel.app/sitemap.xml
```

Then manually: register an account through the UI, log in, open an issue, submit an action, check `/profile` for the resulting Impact Score. This exact flow was run against a local build during development (see README.md "Tests") — running it again against the live URLs is the last mile only you can do, since it needs your public URLs to exist.
