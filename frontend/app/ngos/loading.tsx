export default function NgosLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-12">
      <div className="mb-1 h-7 w-44 rounded bg-black/10" />
      <div className="mb-6 h-4 w-72 rounded bg-black/5" />
      <div className="mb-6 h-10 w-full rounded-full bg-black/5" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 rounded bg-black/10" />
              <div className="h-5 w-16 rounded-full bg-black/10" />
            </div>
            <div className="mt-2 h-3 w-20 rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
