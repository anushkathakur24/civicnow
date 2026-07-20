"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export default function NgoApplyPage() {
  const [form, setForm] = useState({
    name: "",
    contact_email: "",
    city: "",
    website: "",
    darpan_id: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.applyNgo({
        name: form.name,
        contact_email: form.contact_email,
        city: form.city || undefined,
        website: form.website || undefined,
        darpan_id: form.darpan_id || undefined,
        message: form.message || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent";

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <h1 className="mb-3 font-serif text-display-sm font-medium text-ink">Received</h1>
        <p className="mb-8 text-sm leading-relaxed text-ink/60">
          Your organisation now appears in the NGO directory, marked &ldquo;Unverified&rdquo; until we
          confirm your Darpan ID and reach out at the email you provided. No automated approval:
          a real person checks every application.
        </p>
        <Link href="/ngos" className="text-sm font-medium text-accent-dark hover:underline">
          View the NGO directory →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <Reveal>
        <h1 className="mb-2 font-serif text-display-sm font-medium text-ink">List your NGO</h1>
        <p className="mb-4 text-sm leading-relaxed text-ink/55">
          CivicNow refers people who want to act on a specific issue to organisations already working
          on it. Listed NGOs get direct traffic from issue pages and appear when someone searches by
          city or focus area.
        </p>
        <div className="mb-8 rounded-2xl border border-line bg-mist/50 p-4 text-xs leading-relaxed text-ink/60">
          <p className="mb-1.5 font-semibold uppercase tracking-wide text-ink/45">What verification means</p>
          <p>
            &ldquo;Verified&rdquo; on CivicNow means we&apos;ve confirmed your NGO Darpan registration ID
            against the government registry, not an endorsement of your work. Applications without a
            Darpan ID are still listed, clearly marked &ldquo;Unverified,&rdquo; while you sort that out.
            Every check is done manually; there&apos;s no automated approval.
          </p>
        </div>
      </Reveal>

      <form onSubmit={onSubmit} className="space-y-4">
        <input required placeholder="Organisation name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
        <input type="email" required placeholder="Contact email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className={inputClass} />
        <input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
        <input placeholder="Website (optional)" value={form.website} onChange={(e) => update("website", e.target.value)} className={inputClass} />
        <input placeholder="NGO Darpan ID (optional)" value={form.darpan_id} onChange={(e) => update("darpan_id", e.target.value)} className={inputClass} />
        <textarea
          placeholder="What does your organisation do? (optional)"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={3}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={busy} className="w-full py-3">
          {busy ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </div>
  );
}
