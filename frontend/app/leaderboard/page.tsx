import { api } from "@/lib/api";

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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-ink">Leaderboard</h1>
      <p className="mb-6 text-sm text-ink/60">
        Opt-in only — most CivicNow users keep their Impact Score private by default.
      </p>
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">Couldn&apos;t reach the CivicNow API — try refreshing shortly.</p>
        </div>
      )}
      {!error && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-ink/50">
          No one has opted into the public leaderboard yet. Impact Scores are private by default —
          this list only shows accounts that explicitly chose to appear here.
        </div>
      )}
      {!error && rows.length > 0 && (
        <ol className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
          {rows.map((r) => (
            <li key={r.username} className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-3">
                <span className="w-6 text-sm font-semibold text-ink/40">#{r.rank}</span>
                <span className="font-medium text-ink">{r.display_name}</span>
                <span className="text-sm text-ink/40">@{r.username}</span>
              </span>
              <span className="font-semibold text-teal">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
