export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-12">
      <div className="mb-2 h-7 w-40 rounded bg-black/10" />
      <div className="mb-6 h-4 w-64 rounded bg-black/5" />
      <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-5 rounded bg-black/10" />
              <div className="h-4 w-32 rounded bg-black/10" />
            </div>
            <div className="h-4 w-10 rounded bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
