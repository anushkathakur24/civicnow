interface Stat {
  label: string;
  value: string;
}

// Bento-grid of glass cards, Phenomenon Studio-inspired — but numbers stay
// low-contrast-first (monospace, not oversized) so this still reads as an
// ambient trust signal, not a dashboard demanding attention. The "every
// number is counted directly from the database" disclaimer lives with the
// caller (app/page.tsx), directly beneath this — that's the actual trust
// feature; the glass styling is just texture on top of it.
export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 px-4 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass rounded-2xl border border-line/70 px-4 py-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-sm"
        >
          <div className="font-mono text-2xl font-semibold tracking-tight text-ink">{s.value}</div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-ink/40">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
