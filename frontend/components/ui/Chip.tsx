import type { ReactNode } from "react";

// Every colored pill in the product (urgency, impact, verification state,
// difficulty, "verified") renders through this one component so they share
// size/weight/radius and only differ by a semantic tone — color communicates
// meaning here, nothing is decorative.
export type ChipTone = "neutral" | "accent" | "teal" | "amber" | "red";

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: "bg-mist text-ink/60",
  accent: "bg-accent-soft text-accent-dark",
  teal: "bg-teal/10 text-teal",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
};

// Opt-in halo for the highest-stakes tones — a critical/high-urgency pill
// gets a quiet glow instead of just a flat fill, borrowed from the reference
// but kept subtle: a shadow, not a neon ring. Every other tone (and every
// existing call site that doesn't pass `glow`) is unaffected.
const GLOW_SHADOW: Partial<Record<ChipTone, string>> = {
  red: "shadow-glow-sm",
  accent: "shadow-glow-sm",
  teal: "shadow-glow-teal",
};

export default function Chip({
  children,
  tone = "neutral",
  glow = false,
  className = "",
}: {
  children: ReactNode;
  tone?: ChipTone;
  glow?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]} ${
        glow ? GLOW_SHADOW[tone] || "" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}
