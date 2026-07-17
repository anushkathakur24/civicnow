"use client";

import { useMemo, useState } from "react";
import { NGO } from "@/lib/api";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
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

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-sm text-ink/45">
          {ngos.length === 0 ? "No NGOs listed yet." : `No NGOs match "${query}".`}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((n, i) => (
          <Reveal key={n.id} delay={Math.min(i * 0.04, 0.25)}>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-ink">{n.name}</div>
                {n.verified ? (
                  <Chip tone="teal" className="shrink-0">Verified</Chip>
                ) : (
                  <Chip tone="neutral" className="shrink-0">Unverified</Chip>
                )}
              </div>
              {typeof n.city === "string" && n.city && <div className="mt-0.5 text-sm text-ink/50">{n.city}</div>}
              {!n.verified && (
                <p className="mt-2 text-xs text-amber-700">
                  Registration not yet confirmed — shown transparently rather than hidden or presented as verified.
                </p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
