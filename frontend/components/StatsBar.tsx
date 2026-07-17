interface Stat {
  label: string;
  value: string;
}

export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-2xl font-bold text-ink">{s.value}</div>
          <div className="text-xs text-ink/60">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
