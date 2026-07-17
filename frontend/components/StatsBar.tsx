interface Stat {
  label: string;
  value: string;
}

// A quiet signal, not a dashboard: numbers sit low-contrast against the page
// with thin dividers instead of boxed KPI tiles, so they read as ambient
// trust rather than something demanding attention.
export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap justify-center divide-x divide-line px-4 py-2">
      {stats.map((s) => (
        <div key={s.label} className="px-6 py-4 text-center first:pl-0 last:pr-0">
          <div className="font-serif text-2xl font-medium text-ink">{s.value}</div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink/40">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
