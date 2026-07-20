import { api } from "@/lib/api";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import HomeIssueBrowser from "./HomeIssueBrowser";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import JourneyGraphic from "@/components/JourneyGraphic";

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
  const verifiedNgoCount = ngos.filter((n) => n.verified).length;

  return (
    <div>
      {/* ---- Hero: the copy is the design — short lines, generous space ---- */}
      <section className="bg-dot-grid relative mx-auto max-w-xl overflow-hidden px-5 pb-20 pt-28 text-center sm:pt-36">
        {/* Quiet warm blooms behind the headline — the reference's "glowing
            gradient orb," toned down to sit behind type, not compete with it. */}
        <div
          aria-hidden
          className="glow-orb pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 sm:h-96 sm:w-96"
        />
        <Reveal className="relative z-10">
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.25em] text-accent-dark">
            Outrage fades. Action doesn&apos;t.
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
          <div className="flex justify-center">
            <ButtonLink href="#issues" variant="primary" className="px-6 py-3">
              Explore Issues
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ---- Understand → Track → Act — shared component, see
          components/JourneyGraphic.tsx (also used on About and issue
          pages) so the motif reads identically everywhere. ---- */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <JourneyGraphic />
      </section>

      {/* ---- Flagship issue ---- */}
      {flagship && (
        <Reveal delay={0.05}>
          <section className="mx-auto max-w-3xl px-5 py-6">
            <Link href={`/issues/${flagship.id}`} className="block">
              <div className="group rounded-4xl border border-line bg-gradient-to-br from-accent-soft/60 to-white p-9 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow sm:p-12">
                <Chip tone="red" glow className="mb-4">Most urgent right now</Chip>
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
            We couldn&apos;t reach the CivicNow API just now. Nothing fabricated is shown in its place.
            Try refreshing shortly.
          </p>
        </div>
      ) : (
        <Reveal className="pt-6">
          <StatsBar
            stats={[
              { label: "Active Issues", value: String(issues.length) },
              { label: "NGOs Listed", value: String(ngos.length) },
              { label: "Verified NGOs", value: String(verifiedNgoCount) },
              { label: "Sources Cited", value: String(sourcesCited) },
            ]}
          />
          <p className="mx-auto mb-4 max-w-md px-4 text-center text-[11px] text-ink/35">
            Every number above is counted directly from what&apos;s in the database right now, not a
            marketing figure.
          </p>
        </Reveal>
      )}

      <HomeIssueBrowser issues={issues} apiError={apiError} />

      {/* ---- Closing CTA: once someone's actually looked at an issue,
          this is where the account/tracking pitch belongs, not upfront
          in the hero next to the thing we actually want them to do
          first. JourneyStrip still appears in the footer on every page,
          so that motif isn't lost by removing it from here. ---- */}
      <Reveal className="px-5 pb-20 pt-8">
        <section className="mx-auto max-w-xl text-center">
          <p className="mb-5 text-sm text-ink/65">
            Took an action? Track it, and everything else you do, in one place.
          </p>
          <ButtonLink href="/register" variant="primary" className="px-6 py-3">
            Start your Impact Score
          </ButtonLink>
        </section>
      </Reveal>
    </div>
  );
}
