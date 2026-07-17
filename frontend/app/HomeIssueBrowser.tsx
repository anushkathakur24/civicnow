"use client";

import { useMemo, useState } from "react";
import { IssueSummary } from "@/lib/api";
import IssueCard from "@/components/IssueCard";
import Reveal from "@/components/ui/Reveal";

export default function HomeIssueBrowser({
  issues,
  apiError,
}: {
  issues: IssueSummary[];
  apiError: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return issues;
    // Honest, simple substring search over data we actually have (title,
    // category, summary) — not a claim to search laws/officials/districts
    // we don't model.
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q)
    );
  }, [issues, query]);

  return (
    <section id="issues" className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-display-sm font-medium text-ink">Active issues</h2>
            <p className="mt-1 text-sm text-ink/50">Every issue below is real, sourced, and tracked.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35"
              width="16" height="16" viewBox="0 0 20 20" fill="none"
            >
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search issues by title, category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>
      </Reveal>

      {issues.length === 0 && !apiError && (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-sm text-ink/45">
          No published issues yet.
        </div>
      )}

      {issues.length > 0 && filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-sm text-ink/45">
          No issues match &ldquo;{query}&rdquo;. Try a different search term.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((issue, i) => (
          <Reveal key={issue.id} delay={Math.min(i * 0.05, 0.3)}>
            <IssueCard issue={issue} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
