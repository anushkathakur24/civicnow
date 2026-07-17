"use client";

import { useEffect, useState } from "react";
import { api, ActionDefinition, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PERSONAS } from "@/lib/personas";
import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Chip, { ChipTone } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

// Difficulty is derived from the real `effort_hours` field on every action —
// never a separate, hand-picked label that could drift from reality.
function difficultyOf(hours: number | null): { label: string; tone: ChipTone } {
  if (hours == null) return { label: "Flexible", tone: "neutral" };
  if (hours <= 1) return { label: "Quick", tone: "teal" };
  if (hours <= 3) return { label: "Moderate", tone: "amber" };
  return { label: "Committed", tone: "accent" };
}

const VERIFICATION_LABELS: Record<string, string> = {
  self_reported: "Self-reported",
  document_upload: "Document verification",
  receipt_upload: "Receipt verification",
  social_post_verification: "Post verification",
  ngo_confirmation: "NGO-confirmed",
};

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

  const IMPACT_TONE: Record<string, ChipTone> = { high: "accent", medium: "amber", low: "neutral" };

  return (
    <section id="how-you-can-help" className="mb-4">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent-dark">The action engine</p>
        <h2 className="mb-2 font-serif text-display-sm font-medium text-ink">How you can help</h2>
        <p className="mx-auto max-w-md text-sm text-ink/55">
          Matched to your role — not a generic &ldquo;volunteer&rdquo; button. Pick what fits you right now.
        </p>
        <p className="mt-2 text-xs text-ink/35">No account needed to browse — only to mark one done.</p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
              persona === p.id
                ? "border-ink bg-ink text-white"
                : "border-line text-ink/65 hover:border-ink/25 hover:bg-mist/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isOwnPersona && (
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-teal">
          Recommended for you, based on your profile
        </p>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl border border-line bg-white p-6">
              <div className="mb-4 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-mist" />
                <div className="h-5 w-16 rounded-full bg-mist" />
              </div>
              <div className="mb-2 h-4 w-full rounded bg-mist" />
              <div className="mb-5 h-4 w-3/4 rounded bg-mist" />
              <div className="h-9 w-28 rounded-full bg-mist" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((a, i) => {
            const difficulty = difficultyOf(a.effort_hours);
            const isDone = Boolean(submitted[a.id]);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  hover={!isDone}
                  className={`flex h-full flex-col ${isDone ? "border-teal/30 bg-teal/[0.03]" : ""}`}
                >
                  <div className="mb-4 flex flex-wrap items-center gap-1.5">
                    <Chip tone={IMPACT_TONE[a.impact] || "neutral"}>{a.impact} impact</Chip>
                    <Chip tone={difficulty.tone}>{difficulty.label}</Chip>
                    {a.effort_hours != null && (
                      <span className="text-xs text-ink/40">~{a.effort_hours}h</span>
                    )}
                    {a.cost_inr ? <span className="text-xs text-ink/40">₹{a.cost_inr}</span> : null}
                  </div>

                  <p className="mb-5 flex-1 text-[15px] leading-relaxed text-ink/80">{a.action_text}</p>

                  <div className="mb-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink/35">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                      <path d="M10 5v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    {VERIFICATION_LABELS[a.verification_method] || a.verification_method}
                    {a.recurring && <span>· recurring</span>}
                  </div>

                  {!user ? (
                    <Link href="/login" className="text-sm font-medium text-accent-dark hover:underline">
                      Log in to take this action →
                    </Link>
                  ) : isDone ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                      </svg>
                      {submitted[a.id] === "auto_approved" ? "Done — points awarded" : "Done — pending verification"}
                    </span>
                  ) : (
                    <Button onClick={() => handleSubmit(a)} variant="primary" className="w-fit bg-accent hover:bg-accent-dark">
                      I did this
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
          {actions.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-line p-8 text-center text-sm text-ink/50">
              No actions are defined yet for this role on this issue. This is shown honestly rather than
              filled with a generic placeholder — check back, or try a different role above.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
