export default function IssueLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-5 py-16 text-center">
      <div className="mx-auto mb-4 flex justify-center gap-2">
        <div className="h-5 w-16 rounded-full bg-mist" />
        <div className="h-5 w-24 rounded bg-mist" />
      </div>
      <div className="mx-auto mb-3 h-10 w-4/5 rounded bg-mist" />
      <div className="mx-auto mb-2 h-4 w-full rounded bg-mist" />
      <div className="mx-auto mb-10 h-4 w-3/4 rounded bg-mist" />
      <div className="mb-10 h-28 w-full rounded-4xl bg-mist" />
      <div className="mx-auto mb-6 h-6 w-40 rounded bg-mist" />
      <div className="space-y-6 border-l-2 border-mist pl-7 text-left">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="mb-1.5 h-3 w-24 rounded bg-mist" />
            <div className="h-4 w-full rounded bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}
