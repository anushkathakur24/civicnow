"use client";

import { useEffect, useState } from "react";
import { api, ActionDefinition, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PERSONAS } from "@/lib/personas";
import Link from "next/link";

export default function IssueActions({ issueId }: { issueId: string }) {
  const { user } = useAuth();
  const [persona, setPersona] = useState(user?.persona_id || "citizen");
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getIssueActions(issueId, persona)
      .then(setActions)
      .catch(() => setError("Couldn't load actions for this issue — the API may be temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [issueId, persona]);

  async function handleSubmit(action: ActionDefinition) {
    if (!user) return;
    const idempotencyKey = `${user.id}-${action.id}-${Date.now()}`;
    try {
      const result: any = await api.submitAction({
        action_definition_id: action.id,
        idempotency_key: idempotencyKey,
      });
      setSubmitted((s) => ({ ...s, [action.id]: result.verification_state }));
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    }
  }

  const isOwnPersona = user?.persona_id === persona;

  return (
    <section id="how-you-can-help" className="mb-10">
      <h2 className="mb-1 text-xl font-semibold tracking-tight text-ink">How you can help</h2>
      <p className="mb-4 text-sm text-ink/55">
        Actions are matched to your role — not a generic &ldquo;volunteer&rdquo; button.
      </p>
      <div className="mb-5 flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              persona === p.id
                ? "border-ink bg-ink text-white"
                : "border-black/10 text-ink/70 hover:border-black/20 hover:bg-black/[0.03]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isOwnPersona && (
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-teal">
          Recommended for you, based on your profile
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-black/10 bg-white p-5">
              <div className="mb-3 h-3 w-40 rounded bg-black/10" />
              <div className="mb-2 h-4 w-full rounded bg-black/10" />
              <div className="h-4 w-3/4 rounded bg-black/10" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {actions.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-ink/50">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wide ${
                    a.impact === "high"
                      ? "bg-teal/10 text-teal"
                      : a.impact === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-black/5 text-ink/60"
                  }`}
                >
                  {a.impact} impact
                </span>
                {a.effort_hours != null && <span>~{a.effort_hours}h</span>}
                {a.cost_inr ? <span>₹{a.cost_inr}</span> : null}
                {a.recurring && <span>recurring</span>}
              </div>
              <p className="mb-4 text-[15px] leading-relaxed text-ink/85">{a.action_text}</p>
              {!user ? (
                <Link href="/login" className="text-sm font-medium text-teal hover:underline">
                  Log in to take this action →
                </Link>
              ) : submitted[a.id] ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                  </svg>
                  Submitted — {submitted[a.id] === "auto_approved" ? "points awarded" : "pending verification"}
                </span>
              ) : (
                <button
                  onClick={() => handleSubmit(a)}
                  className="rounded-full bg-teal px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  I did this
                </button>
              )}
            </div>
          ))}
          {actions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-ink/50">
              No actions are defined yet for this role on this issue. This is shown honestly rather than
              filled with a generic placeholder — check back, or try a different role above.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
