"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NGO } from "@/lib/api";
import Card from "@/components/ui/Card";
import SourcedBadge from "@/components/ui/SourcedBadge";
import Reveal from "@/components/ui/Reveal";

export default function NgoBrowser({ ngos }: { ngos: NGO[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ngos;
    return ngos.filter((n) => {
      const city = typeof n.city === "string" ? n.city.toLowerCase() : "";
      return n.name.toLowerCase().includes(q) || city.includes(q);
    });
  }, [ngos, query]);

  return (
    <div>
      <div className="relative mb-6">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search NGOs by name or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      {filtered.length === 0 && ngos.length > 0 && (
        <div className="mb-3 rounded-3xl border border-dashed border-line p-10 text-center text-sm text-ink/45">
          No NGOs match &ldquo;{query}&rdquo;.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((n, i) => (
          <Reveal key={n.id} delay={Math.min(i * 0.04, 0.25)}>
            <Card hover glow className="h-full p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-ink">{n.name}</div>
                {n.verified ? (
                  <SourcedBadge className="shrink-0">Verified</SourcedBadge>
                ) : (
                  <SourcedBadge tone="neutral" icon={false} className="shrink-0">Unverified</SourcedBadge>
                )}
              </div>
              {typeof n.city === "string" && n.city && (
                <div className="mt-1 font-mono text-xs text-ink/40">{n.city}</div>
              )}
              {!n.verified && (
                <p className="mt-2 text-xs text-amber-700">
                  Registration not yet confirmed — shown transparently rather than hidden or presented as verified.
                </p>
              )}
            </Card>
          </Reveal>
        ))}

        {/* Recruitment slot, not an afterthought — always the last card in the
            grid so the directory reads as actively growing rather than a
            closed, finished list. */}
        <Reveal delay={Math.min(filtered.length * 0.04, 0.3)}>
          <Link
            href="/ngos/apply"
            className="group flex h-full min-h-[104px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent-soft/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/40 transition-colors group-hover:border-accent/50 group-hover:text-accent-dark">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-medium text-ink/60 transition-colors group-hover:text-accent-dark">
              List your NGO
            </span>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
