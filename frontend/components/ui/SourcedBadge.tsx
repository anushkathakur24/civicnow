import type { ReactNode } from "react";

// One shared visual language for every "this is confirmed/sourced" moment
// on the site — issue timeline events, government-response sourcing, and
// NGO verification — instead of three slightly different chip treatments.
// Monospace + icon + subtle border, borrowed from the reference's "data tag"
// aesthetic; `teal` is reserved site-wide for verified/trustworthy, `neutral`
// for the honest "not yet confirmed" state.
export type SourcedTone = "teal" | "neutral";

const TONE_CLASSES: Record<SourcedTone, string> = {
  teal: "border-teal/25 bg-teal/[0.06] text-teal",
  neutral: "border-line bg-mist/60 text-ink/45",
};

export function sourcedBadgeClass(tone: SourcedTone = "teal", className = "") {
  return `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide transition-colors ${TONE_CLASSES[tone]} ${className}`;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SourcedBadge({
  children,
  tone = "teal",
  icon = true,
  className = "",
}: {
  children: ReactNode;
  tone?: SourcedTone;
  icon?: boolean;
  className?: string;
}) {
  return (
    <span className={sourcedBadgeClass(tone, className)}>
      {icon && <CheckIcon />}
      {children}
    </span>
  );
}
