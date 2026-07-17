export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      <section className="mx-auto max-w-2xl px-5 pb-14 pt-24 text-center sm:pt-32">
        <div className="mx-auto mb-5 h-3 w-24 rounded-full bg-mist" />
        <div className="mx-auto mb-3 h-11 w-full rounded-lg bg-mist" />
        <div className="mx-auto mb-8 h-11 w-4/5 rounded-lg bg-mist" />
        <div className="mx-auto mb-2 h-4 w-2/3 rounded bg-mist" />
        <div className="mx-auto mb-10 h-4 w-1/2 rounded bg-mist" />
        <div className="flex justify-center gap-3">
          <div className="h-11 w-40 rounded-full bg-mist" />
          <div className="h-11 w-48 rounded-full bg-mist" />
        </div>
      </section>
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-10 px-5 py-16">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="mb-3 h-3 w-6 rounded bg-mist" />
            <div className="mb-2 h-5 w-20 rounded bg-mist" />
            <div className="h-3 w-full rounded bg-mist" />
          </div>
        ))}
      </div>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 h-8 w-40 rounded bg-mist" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-line bg-white p-6">
              <div className="mb-3 h-4 w-24 rounded-full bg-mist" />
              <div className="mb-2 h-5 w-full rounded bg-mist" />
              <div className="mb-1 h-3 w-full rounded bg-mist" />
              <div className="h-3 w-2/3 rounded bg-mist" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
