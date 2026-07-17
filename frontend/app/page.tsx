import { api } from "@/lib/api";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import HomeIssueBrowser from "./HomeIssueBrowser";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import JourneyStrip from "@/components/JourneyStrip";

export const revalidate = 60; // ISR: re-fetch issue list from the API at most once a minute

export default async function HomePage() {
  let issues: Awaited<ReturnType<typeof api.listIssues>> = [];
  let ngos: Awaited<ReturnType<typeof api.ngos>> = [];
  let apiError = false;
  let sourcesCited = 0;

  try {
    [issues, ngos] = await Promise.all([api.listIssues(), api.ngos()]);
    // Every issue detail carries its own real, cited sources — sum them for
    // an honest "Sources cited" stat instead of a made-up engagement number.
    const details = await Promise.all(issues.map((i) => api.getIssue(i.id).catch(() => null)));
    sourcesCited = details.reduce((sum, d) => sum + (d?.sources.length ?? 0), 0);
  } catch {
    apiError = true;
  }

  const flagship = issues.find((i) => i.urgency === "critical") || issues[0];
  const lastRefreshed = issues.length > 0
    ? new Date(Math.max(...issues.map((i) => new Date(i.updated_at).getTime())))
    : null;
  const verifiedNgoCount = ngos.filter((n) => n.verified).length;

  return (
    <div>
      {/* ---- Hero: the copy is the design — short lines, generous space ---- */}
      <section className="mx-auto max-w-xl px-5 pb-20 pt-28 text-center sm:pt-36">
        <Reveal>
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.25em] text-accent-dark">
            Stop scrolling.
          </p>
          <h1 className="mb-8 font-serif text-display-lg font-medium leading-[1.05] text-ink">
            Know More.
            <br />
            Do More.
          </h1>
          <p className="mx-auto mb-3 max-w-sm text-lg leading-relaxed text-ink/55">
            Every issue deserves more than awareness.
          </p>
          <p className="mb-12 text-xs font-semibold uppercase tracking-[0.2em] text-ink/35">
            For Every Issue. For Every Indian.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="#issues" variant="primary" className="px-6 py-3">
              Explore Issues
            </ButtonLink>
            <ButtonLink href="/register" variant="secondary" className="px-6 py-3">
              Start your Impact Score
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ---- Understand → Track → Act ---- */}
      <Reveal delay={0.1}>
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              { step: "01", title: "Understand", copy: "The full, honestly-sourced picture — not a headline stripped of context." },
              { step: "02", title: "Track", copy: "What's actually happened, who's responsible, and what they've done about it." },
              { step: "03", title: "Act", copy: "One real action, matched to your time, skills, and role — not a generic ask." },
            ].map((s) => (
              <div key={s.step} className="text-center sm:text-left">
                <div className="mb-3 font-serif text-sm text-accent-dark">{s.step}</div>
                <h3 className="mb-2 font-serif text-xl font-medium text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink/55">{s.copy}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ---- Flagship issue ---- */}
      {flagship && (
        <Reveal delay={0.05}>
          <section className="mx-auto max-w-3xl px-5 py-6">
            <Link href={`/issues/${flagship.id}`} className="block">
              <div className="group rounded-4xl border border-line bg-gradient-to-br from-accent-soft/60 to-white p-9 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg sm:p-12">
                <Chip tone="red" className="mb-4">Most urgent right now</Chip>
                <h2 className="mb-3 font-serif text-display-sm font-medium text-ink">{flagship.title}</h2>
                <p className="mb-6 max-w-xl text-ink/60">{flagship.summary}</p>
                <span className="inline-flex items-center gap-1 font-medium text-accent-dark transition-transform duration-300 group-hover:translate-x-1">
                  Read the full story and take action →
                </span>
              </div>
            </Link>
          </section>
        </Reveal>
      )}

      {/* ---- Honest live signal ---- */}
      {apiError ? (
        <div className="mx-auto mb-6 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">
            We couldn&apos;t reach the CivicNow API just now — nothing fabricated is shown in its place.
            Try refreshing shortly.
          </p>
        </div>
      ) : (
        <Reveal>
          <div className="mx-auto mb-1 mt-6 flex max-w-6xl items-center justify-center gap-2 px-4 text-xs text-ink/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
            </span>
            Live from the CivicNow API
            {lastRefreshed && (
              <span>
                · issue data last updated{" "}
                {lastRefreshed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          <StatsBar
            stats={[
              { label: "Active Issues", value: String(issues.length) },
              { label: "NGOs Listed", value: String(ngos.length) },
              { label: "Verified NGOs", value: String(verifiedNgoCount) },
              { label: "Sources Cited", value: String(sourcesCited) },
            ]}
          />
          <p className="mx-auto mb-4 max-w-md px-4 text-center text-[11px] text-ink/35">
            Every number above is counted directly from what&apos;s in the database right now — not a
            marketing figure.
          </p>
        </Reveal>
      )}

      <HomeIssueBrowser issues={issues} apiError={apiError} />

      <Reveal className="px-5 pb-4 pt-4">
        <JourneyStrip />
      </Reveal>
    </div>
  );
}
