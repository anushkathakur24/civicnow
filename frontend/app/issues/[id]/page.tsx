import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import IssueActions from "./IssueActions";
import Timeline from "@/components/Timeline";
import SourceList from "@/components/SourceList";
import Reveal from "@/components/ui/Reveal";
import Chip, { ChipTone } from "@/components/ui/Chip";
import ProgressRing from "@/components/ui/ProgressRing";

export const revalidate = 60;

type FetchResult =
  | { state: "ok"; issue: Awaited<ReturnType<typeof api.getIssue>> }
  | { state: "not_found" }
  | { state: "unavailable" };

async function getIssueSafely(id: string): Promise<FetchResult> {
  try {
    const issue = await api.getIssue(id);
    return { state: "ok", issue };
  } catch (e) {
    // A real 404 (issue doesn't exist / isn't published) is different from
    // the API being unreachable — conflating them would either wrongly
    // 404 a real issue during an outage, or silently show nothing when an
    // issue is genuinely missing. Each gets its own honest UI.
    if (e instanceof ApiError && e.status === 404) return { state: "not_found" };
    return { state: "unavailable" };
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const result = await getIssueSafely(params.id);
  if (result.state !== "ok") return { title: "Issue not found" };
  return {
    title: result.issue.title,
    description: result.issue.summary,
    openGraph: { title: result.issue.title, description: result.issue.summary },
  };
}

const URGENCY_TONE: Record<string, ChipTone> = {
  critical: "red",
  high: "accent",
  medium: "amber",
  low: "neutral",
};

const PROMISE_TONE: Record<string, ChipTone> = {
  kept: "teal",
  pending: "amber",
  broken: "red",
  partial: "accent",
  unclear: "neutral",
};

const HISTORY_ACTION_LABELS: Record<string, string> = {
  "issue.created": "Issue page created",
  "timeline_event.added": "Timeline event added",
};

function historyLabel(action: string): string {
  return HISTORY_ACTION_LABELS[action] || action;
}

export default async function IssuePage({ params }: { params: { id: string } }) {
  const result = await getIssueSafely(params.id);

  if (result.state === "not_found") notFound();

  if (result.state === "unavailable") {
    return (
      <div className="mx-auto max-w-lg px-5 py-28 text-center">
        <h1 className="mb-2 font-serif text-2xl font-medium text-ink">Live information temporarily unavailable</h1>
        <p className="mb-8 text-ink/55">
          We couldn&apos;t reach the CivicNow API to load this issue. Nothing is being shown in its
          place rather than risk displaying stale or fabricated content — try again shortly.
        </p>
        <Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-white">
          Back to CivicNow
        </Link>
      </div>
    );
  }

  const issue = result.issue;
  const keptPromises = issue.promises.filter((p) => p.status === "kept").length;
  const totalPromises = issue.promises.length;
  // History is genuinely optional — an issue with no recorded audit entries
  // yet should just show nothing here, not an error, and a failed fetch
  // shouldn't take down the rest of the page.
  const history = await api.getIssueHistory(issue.id).catch(() => []);

  return (
    <article>
      {/* ---- Story: hero ---- */}
      <header className="mx-auto max-w-2xl px-5 pb-10 pt-16 text-center sm:pt-20">
        <Reveal>
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <Chip tone={URGENCY_TONE[issue.urgency] || "neutral"}>{issue.urgency}</Chip>
            <span className="text-xs font-medium uppercase tracking-wide text-ink/40">{issue.category}</span>
          </div>
          <h1 className="mb-5 font-serif text-display-md font-medium text-ink">{issue.title}</h1>
          <p className="mx-auto mb-3 max-w-xl text-lg leading-relaxed text-ink/60">{issue.summary}</p>
          <p className="text-xs text-ink/35">
            Last updated {new Date(issue.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </Reveal>

        {issue.sensitive_note && (
          <Reveal delay={0.1}>
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
              {issue.sensitive_note}
            </div>
          </Reveal>
        )}
      </header>

      {/* ---- Data: current status, at a glance ---- */}
      {issue.current_ask && (
        <Reveal>
          <section className="mx-auto max-w-2xl px-5 pb-14">
            <div className="flex flex-col items-center gap-6 rounded-4xl border border-line bg-white p-8 text-center shadow-soft sm:flex-row sm:text-left">
              {totalPromises > 0 && (
                <ProgressRing value={keptPromises} total={totalPromises} label="Commitments kept" />
              )}
              <div>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Current status</h2>
                <p className="mb-1 font-serif text-lg font-medium text-ink">{issue.status}</p>
                <p className="text-sm leading-relaxed text-ink/60">{issue.current_ask}</p>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ---- Timeline: history unfolding ---- */}
      {issue.timeline.length > 0 && (
        <section className="mx-auto max-w-2xl px-5 py-8">
          <Reveal>
            <h2 className="mb-1 font-serif text-display-sm font-medium text-ink">How we got here</h2>
            <p className="mb-8 text-sm text-ink/50">Tap any moment to see where it came from.</p>
          </Reveal>
          <Timeline events={issue.timeline} />
        </section>
      )}

      {/* ---- Data: government response ---- */}
      {issue.promises.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-2xl px-5 py-8">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-serif text-display-sm font-medium text-ink">Government response</h2>
              <span className="text-sm text-ink/45">{keptPromises} of {totalPromises} kept</span>
            </div>
            <div className="space-y-3">
              {issue.promises.map((p, i) => (
                <div key={i} className="rounded-2xl border border-line bg-white p-5">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{p.made_by}</span>
                    <Chip tone={PROMISE_TONE[p.status] || "neutral"}>{p.status}</Chip>
                  </div>
                  <p className="text-sm leading-relaxed text-ink/65">{p.promise_text}</p>
                  {p.source_url && (
                    <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-ink/40 hover:text-accent-dark hover:underline">
                      View source →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---- Data: who's responsible ---- */}
      {issue.responsible_bodies.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-2xl px-5 py-8">
            <h2 className="mb-4 font-serif text-display-sm font-medium text-ink">Who&apos;s responsible</h2>
            <div className="flex flex-wrap gap-2">
              {issue.responsible_bodies.map((b, i) => (
                <span key={i} className="rounded-full border border-line bg-white px-3.5 py-2 text-sm text-ink/70">
                  {b}
                </span>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---- Actions: the heart of the product ---- */}
      <section className="mx-auto max-w-4xl px-5 py-14">
        <IssueActions issueId={issue.id} />
      </section>

      {/* ---- Sources: trust ---- */}
      <Reveal>
        <section className="mx-auto max-w-2xl border-t border-line px-5 py-12">
          <h2 className="mb-1 font-serif text-display-sm font-medium text-ink">Verified sources</h2>
          <p className="mb-6 text-sm text-ink/50">
            Every fact on this page traces back to one of these. Nothing here is generated or inferred.
          </p>
          <SourceList sources={issue.sources} />
        </section>
      </Reveal>

      {/* ---- Version History ---- */}
      {history.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-2xl px-5 py-10">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/40">Version history</h2>
            <p className="mb-4 text-xs text-ink/35">
              A real, immutable log of when this page&apos;s content was authored or updated — not a
              simulated changelog.
            </p>
            <ul className="space-y-2 text-sm">
              {history.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-ink/65">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/25" />
                  <span>
                    <span className="font-medium text-ink/80">{historyLabel(h.action)}</span>
                    {h.log_metadata && "summary" in h.log_metadata && (
                      <span> — {String(h.log_metadata.summary)}</span>
                    )}
                    <span className="ml-2 text-xs text-ink/35">
                      {new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      <section className="mx-auto mb-14 max-w-2xl px-5">
        <div className="rounded-3xl border border-line bg-mist/50 p-6 text-center">
          <p className="mb-2 text-sm text-ink/60">Looking for organisations working in this space?</p>
          <Link href="/ngos" className="text-sm font-medium text-accent-dark hover:underline">
            Browse verified NGOs →
          </Link>
        </div>
      </section>
    </article>
  );
}
