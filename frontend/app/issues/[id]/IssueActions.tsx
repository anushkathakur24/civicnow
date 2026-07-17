"use client";

import { useEffect, useState } from "react";
import { api, ActionDefinition, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const PERSONAS = [
  { id: "citizen", label: "Citizen" },
  { id: "content_creator", label: "Content Creator" },
  { id: "working_professional", label: "Working Professional" },
  { id: "government_official", label: "Government Official" },
];

export default function IssueActions({ issueId }: { issueId: string }) {
  const { user } = useAuth();
  const [persona, setPersona] = useState(user?.persona_id || "citizen");
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    api
      .getIssueActions(issueId, persona)
      .then(setActions)
      .catch(() => setError("Couldn't load actions for this issue."))
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

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-ink">What you can do</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`rounded-full border px-3 py-1 text-sm ${
              persona === p.id ? "border-ink bg-ink text-white" : "border-black/15 text-ink/70"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ink/50">Loading actions…</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {actions.map((a) => (
          <div key={a.id} className="rounded-xl border border-black/10 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-ink/50">
              <span className="rounded-full bg-black/5 px-2 py-0.5 uppercase">{a.impact} impact</span>
              {a.effort_hours != null && <span>~{a.effort_hours}h</span>}
              {a.cost_inr ? <span>₹{a.cost_inr}</span> : null}
              {a.recurring && <span>recurring</span>}
            </div>
            <p className="mb-3 text-sm text-ink/85">{a.action_text}</p>
            {!user ? (
              <Link href="/login" className="text-sm font-medium text-teal hover:underline">
                Log in to take this action →
              </Link>
            ) : submitted[a.id] ? (
              <span className="text-sm font-medium text-green-700">
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
        {!loading && actions.length === 0 && (
          <p className="text-sm text-ink/50">No actions defined yet for this persona on this issue.</p>
        )}
      </div>
    </section>
  );
}
