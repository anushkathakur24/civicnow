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
      {error && <p className="text-red-600">Couldn&apos;t load the leaderboard.</p>}
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
        {rows.length === 0 && !error && (
          <li className="px-4 py-6 text-center text-sm text-ink/50">No opted-in users yet.</li>
        )}
      </ol>
    </div>
  );
}
