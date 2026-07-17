export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-5 py-16">
      <div className="mb-2 h-8 w-40 rounded bg-mist" />
      <div className="mb-8 h-4 w-64 rounded bg-mist" />
      <div className="divide-y divide-line rounded-3xl border border-line bg-white">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-5 rounded bg-mist" />
              <div className="h-4 w-32 rounded bg-mist" />
            </div>
            <div className="h-4 w-10 rounded bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}
