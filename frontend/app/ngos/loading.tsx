export default function NgosLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-5 py-16">
      <div className="mb-1 h-8 w-44 rounded bg-mist" />
      <div className="mb-8 h-4 w-72 rounded bg-mist" />
      <div className="mb-6 h-10 w-full rounded-full bg-mist" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 rounded bg-mist" />
              <div className="h-5 w-16 rounded-full bg-mist" />
            </div>
            <div className="mt-2 h-3 w-20 rounded bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}
