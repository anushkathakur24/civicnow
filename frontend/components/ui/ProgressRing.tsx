// A quiet SVG ring for showing a real computed ratio (e.g. commitments kept
// out of commitments made). Deliberately not a chart library — one honest
// number, presented calmly, with a caption underneath so it's never
// ambiguous what's being measured.
export default function ProgressRing({
  value,
  total,
  size = 72,
  strokeWidth = 6,
  label,
}: {
  value: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1EDE4"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#D97F2E"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink">
          {value}/{total}
        </div>
      </div>
      {label && <span className="text-[11px] font-medium uppercase tracking-wide text-ink/45">{label}</span>}
    </div>
  );
}
