export default function IssueLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-10">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-black/10" />
        <div className="h-5 w-24 rounded bg-black/5" />
      </div>
      <div className="mb-3 h-9 w-4/5 rounded bg-black/10" />
      <div className="mb-2 h-4 w-full rounded bg-black/5" />
      <div className="mb-6 h-4 w-3/4 rounded bg-black/5" />
      <div className="mb-8 h-24 w-full rounded-2xl bg-black/5" />
      <div className="mb-4 h-6 w-32 rounded bg-black/10" />
      <div className="space-y-4 border-l-2 border-black/5 pl-5">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="mb-1 h-3 w-24 rounded bg-black/10" />
            <div className="h-4 w-full rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
