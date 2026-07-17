"use client";

import { useMemo, useState } from "react";
import { IssueSummary } from "@/lib/api";
import IssueCard from "@/components/IssueCard";

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
    <section id="issues" className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Active issues</h2>
        <div className="relative w-full sm:w-72">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35"
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
            className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-teal"
          />
        </div>
      </div>

      {issues.length === 0 && !apiError && (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-ink/50">
          No published issues yet.
        </div>
      )}

      {issues.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-ink/50">
          No issues match &ldquo;{query}&rdquo;. Try a different search term.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </section>
  );
}
