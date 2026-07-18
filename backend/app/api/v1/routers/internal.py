"""Temporary, token-gated endpoint to run one-off data backfill scripts on
Render's free tier, which doesn't include Shell or One-Off Jobs access.

This is meant to be used ONCE — hit the endpoint, confirm the scripts ran,
then remove this file and its `include_router` line from app/main.py in a
follow-up commit. It is not something that should stay in the codebase
long-term: it executes local scripts on request, gated only by a shared
secret compared with constant-time equality, which is a reasonable one-time
convenience but not something to leave standing indefinitely.

Setup: set an INTERNAL_ADMIN_TOKEN environment variable on the Render
service (Environment tab) to any random secret value before calling this.
If that variable isn't set, the endpoint always returns 403 — there's no
way to trigger it by accident on a deploy that hasn't opted in.

Usage (PowerShell), once deployed:
    Invoke-RestMethod -Uri "https://<your-backend>.onrender.com/internal/run-backfill" `
      -Method POST -Headers @{ "X-Internal-Token" = "<the secret you set>" } -TimeoutSec 180
"""
import hmac
import os
import subprocess
import sys
from pathlib import Path

from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/internal", tags=["internal"])

BACKEND_ROOT = Path(__file__).resolve().parents[4]  # .../backend

# Order matters: the Wangchuk backfill updates a HelpAction row that only
# exists after the support/help-actions backfill creates it.
SCRIPTS = [
    "scripts/fix_seed_ngos_2026_07.py",
    "scripts/backfill_support_and_help_actions_2026_07.py",
    "scripts/backfill_wangchuk_hospitalization_2026_07_18.py",
]


@router.post("/run-backfill")
def run_backfill(x_internal_token: str | None = Header(default=None)):
    expected = os.environ.get("INTERNAL_ADMIN_TOKEN")
    if not expected or not x_internal_token or not hmac.compare_digest(x_internal_token, expected):
        raise HTTPException(403, "Forbidden")

    results = []
    for script in SCRIPTS:
        script_path = BACKEND_ROOT / script
        proc = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True, text=True, timeout=120, cwd=str(BACKEND_ROOT),
        )
        results.append({
            "script": script,
            "returncode": proc.returncode,
            "stdout": proc.stdout.strip(),
            "stderr": proc.stderr.strip()[-2000:],  # cap so a runaway traceback doesn't blow up the response
        })
        if proc.returncode != 0:
            # Stop rather than run later scripts against a half-applied state.
            break

    return {"results": results}
