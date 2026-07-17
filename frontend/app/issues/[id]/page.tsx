import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import IssueActions from "./IssueActions";

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

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-700",
};

const PROMISE_STYLES: Record<string, string> = {
  kept: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  broken: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-700",
  unclear: "bg-gray-100 text-gray-700",
};

export default async function IssuePage({ params }: { params: { id: string } }) {
  const result = await getIssueSafely(params.id);

  if (result.state === "not_found") notFound();

  if (result.state === "unavailable") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-ink">Live information temporarily unavailable</h1>
        <p className="mb-6 text-ink/60">
          We couldn&apos;t reach the CivicNow API to load this issue. Nothing is being shown in its
          place rather than risk displaying stale or fabricated content — try again shortly.
        </p>
        <Link href="/" className="rounded-full bg-ink px-5 py-2 text-white">
          Back to CivicNow
        </Link>
      </div>
    );
  }

  const issue = result.issue;
  const keptPromises = issue.promises.filter((p) => p.status === "kept").length;
  const totalPromises = issue.promises.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* ---- Overview ---- */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${URGENCY_STYLES[issue.urgency] || URGENCY_STYLES.low}`}>
          {issue.urgency}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-ink/45">{issue.category}</span>
        <span className="text-xs text-ink/35">
          · Last updated {new Date(issue.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-ink">{issue.title}</h1>
      <p className="mb-6 text-[17px] leading-relaxed text-ink/70">{issue.summary}</p>

      {issue.sensitive_note && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {issue.sensitive_note}
        </div>
      )}

      {/* ---- Current Status / Current Ask ---- */}
      {issue.current_ask && (
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/45">Current status</h2>
          <p className="mb-1 text-sm font-medium text-ink">{issue.status}</p>
          <p className="text-ink/70">{issue.current_ask}</p>
        </div>
      )}

      {/* ---- Timeline ---- */}
      {issue.timeline.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">Timeline</h2>
          <ol className="space-y-4 border-l-2 border-black/10 pl-5">
            {issue.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-teal" />
                <div className="mb-0.5 flex items-center gap-2 text-xs font-medium text-teal">
                  {new Date(t.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {t.verified && (
                    <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal">
                      Sourced
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/80">{t.event_text}</p>
                {t.source_url && (
                  <a href={t.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink/40 hover:text-teal hover:underline">
                    View source →
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---- Government Response / Progress ---- */}
      {issue.promises.length > 0 && (
        <section className="mb-8">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-ink">Government response</h2>
            <span className="text-sm text-ink/50">{keptPromises} of {totalPromises} commitments kept</span>
          </div>
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-teal transition-all"
              style={{ width: totalPromises ? `${(keptPromises / totalPromises) * 100}%` : "0%" }}
            />
          </div>
          <div className="space-y-3">
            {issue.promises.map((p, i) => (
              <div key={i} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{p.made_by}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${PROMISE_STYLES[p.status] || PROMISE_STYLES.unclear}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-sm text-ink/70">{p.promise_text}</p>
                {p.source_url && (
                  <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-ink/40 hover:text-teal hover:underline">
                    View source →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Who's Responsible ---- */}
      {issue.responsible_bodies.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold tracking-tight text-ink">Who&apos;s responsible</h2>
          <div className="flex flex-wrap gap-2">
            {issue.responsible_bodies.map((b, i) => (
              <span key={i} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-ink/75">
                {b}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ---- How You Can Help (client component: persona-based actions) ---- */}
      <IssueActions issueId={issue.id} />

      {/* ---- Verified Sources ---- */}
      <section className="mt-10 border-t border-black/10 pt-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink/45">Verified sources</h2>
        <p className="mb-3 text-xs text-ink/40">
          Every fact on this page traces back to one of these. No detail here is generated or inferred.
        </p>
        {issue.sources.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {issue.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/40">No sources recorded for this issue yet.</p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-5 text-center">
        <p className="mb-2 text-sm text-ink/60">Looking for organisations working in this space?</p>
        <Link href="/ngos" className="text-sm font-medium text-teal hover:underline">
          Browse verified NGOs →
        </Link>
      </section>
    </div>
  );
}
