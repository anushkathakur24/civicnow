import Link from "next/link";
import { api } from "@/lib/api";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 30;
export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  let rows: Awaited<ReturnType<typeof api.leaderboard>> = [];
  let error = false;
  try {
    rows = await api.leaderboard("global");
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Reveal>
        <h1 className="mb-2 font-serif text-display-sm font-medium text-ink">Leaderboard</h1>
        <p className="mb-8 text-sm text-ink/55">
          Opt-in only — most CivicNow users keep their Impact Score private by default.
        </p>
      </Reveal>
      {error && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">Couldn&apos;t reach the CivicNow API — try refreshing shortly.</p>
        </div>
      )}
      {!error && rows.length === 0 && (
        <Reveal delay={0.05}>
          <div className="glass rounded-3xl border border-dashed border-line p-10 text-center">
            <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink/35">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l1.9 4.6 5 .4-3.8 3.3 1.2 4.9L10 12.8 5.7 15.2l1.2-4.9-3.8-3.3 5-.4L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mb-1 text-sm font-medium text-ink/70">Nobody&apos;s opted in yet</p>
            <p className="mx-auto max-w-xs text-xs leading-relaxed text-ink/45">
              Impact Scores are private by default — this list only shows accounts that explicitly
              chose to appear here. Be the first.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent-dark hover:underline"
            >
              Create an account →
            </Link>
          </div>
        </Reveal>
      )}
      {!error && rows.length > 0 && (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const isTop3 = r.rank <= 3;
            return (
              <Reveal key={r.username || `${r.rank}-${r.display_name}`} delay={Math.min(i * 0.04, 0.3)}>
                <li
                  className={`glass flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-sm ${
                    isTop3 ? "border-accent/25 shadow-glow-sm" : "border-line/70"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                        isTop3 ? "bg-accent-soft text-accent-dark" : "text-ink/35"
                      }`}
                    >
                      {r.rank}
                    </span>
                    <span className="font-medium text-ink">{r.display_name}</span>
                    {r.username && <span className="text-sm text-ink/40">@{r.username}</span>}
                  </span>
                  <span className="font-mono font-semibold text-accent-dark">{r.score}</span>
                </li>
              </Reveal>
            );
          })}
        </ol>
      )}
    </div>
  );
}
