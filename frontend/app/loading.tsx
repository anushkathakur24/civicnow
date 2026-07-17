export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-20 text-center">
        <div className="mx-auto mb-4 h-11 w-4/5 rounded-lg bg-black/5" />
        <div className="mx-auto mb-8 h-11 w-3/5 rounded-lg bg-black/5" />
        <div className="mx-auto mb-8 h-4 w-2/3 rounded bg-black/5" />
        <div className="flex justify-center gap-3">
          <div className="h-11 w-40 rounded-full bg-black/10" />
          <div className="h-11 w-48 rounded-full bg-black/5" />
        </div>
      </section>
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-1 h-6 w-12 rounded bg-black/10" />
            <div className="mx-auto h-3 w-16 rounded bg-black/5" />
          </div>
        ))}
      </div>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 h-8 w-40 rounded bg-black/10" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="mb-3 h-4 w-24 rounded-full bg-black/10" />
              <div className="mb-2 h-5 w-full rounded bg-black/10" />
              <div className="mb-1 h-3 w-full rounded bg-black/5" />
              <div className="h-3 w-2/3 rounded bg-black/5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
