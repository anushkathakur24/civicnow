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
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-sm text-ink/45">
          No one has opted into the public leaderboard yet. Impact Scores are private by default —
          this list only shows accounts that explicitly chose to appear here.
        </div>
      )}
      {!error && rows.length > 0 && (
        <Reveal delay={0.1}>
          <ol className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
            {rows.map((r) => (
              <li key={r.username || `${r.rank}-${r.display_name}`} className="flex items-center justify-between px-5 py-4">
                <span className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-ink/35">#{r.rank}</span>
                  <span className="font-medium text-ink">{r.display_name}</span>
                  {r.username && <span className="text-sm text-ink/40">@{r.username}</span>}
                </span>
                <span className="font-serif font-semibold text-accent-dark">{r.score}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      )}
    </div>
  );
}
