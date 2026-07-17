"use client";

import { useMemo, useState } from "react";
import { NGO } from "@/lib/api";

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
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Search NGOs by name or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-teal"
        />
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-ink/50">
          {ngos.length === 0 ? "No NGOs listed yet." : `No NGOs match "${query}".`}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-ink">{n.name}</div>
              {n.verified ? (
                <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">Verified</span>
              ) : (
                <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-ink/40">Unverified</span>
              )}
            </div>
            {typeof n.city === "string" && n.city && <div className="mt-0.5 text-sm text-ink/50">{n.city}</div>}
            {!n.verified && (
              <p className="mt-2 text-xs text-amber-700">
                Registration not yet confirmed — shown transparently rather than hidden or presented as verified.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
