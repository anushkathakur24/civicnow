import { api } from "@/lib/api";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import HomeIssueBrowser from "./HomeIssueBrowser";

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
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-20 text-center">
        <h1 className="mb-5 text-[2.6rem] font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Stop scrolling past the news.
          <br />
          <span className="text-saffron">Start doing something about it.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-ink/60">
          <span className="font-medium text-ink/80">Understand.</span>{" "}
          <span className="font-medium text-ink/80">Track.</span>{" "}
          <span className="font-medium text-ink/80">Act.</span>
          <br className="hidden sm:block" />
          Real civic issues, matched to real actions for your role — with a verified,
          server-side Impact Score for what you actually do.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="#issues" className="rounded-full bg-ink px-6 py-3 font-medium text-white hover:opacity-90">
            See active issues
          </Link>
          <Link href="/register" className="rounded-full border border-ink/15 px-6 py-3 font-medium text-ink hover:bg-ink/[0.03]">
            Start your Impact Score
          </Link>
        </div>
      </section>

      {apiError ? (
        <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">
            We couldn&apos;t reach the CivicNow API just now — nothing fabricated is shown in its place.
            Try refreshing shortly.
          </p>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-1 flex max-w-6xl items-center justify-center gap-2 px-4 text-xs text-ink/40">
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
        </>
      )}

      {flagship && (
        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-orange-50 to-white p-8">
            <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
              Urgent
            </span>
            <h2 className="mb-2 text-2xl font-bold text-ink">{flagship.title}</h2>
            <p className="mb-4 text-ink/70">{flagship.summary}</p>
            <Link href={`/issues/${flagship.id}`} className="font-medium text-teal hover:underline">
              Read the full timeline and take action →
            </Link>
          </div>
        </section>
      )}

      <HomeIssueBrowser issues={issues} apiError={apiError} />
    </div>
  );
}
