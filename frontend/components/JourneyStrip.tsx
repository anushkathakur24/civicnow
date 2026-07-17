// The recurring "Understand → Track → Act" motif — CivicNow's product
// journey, used as a lightweight visual anchor across the site (footer,
// About page, homepage section divider). Deliberately minimal: text and thin
// arrows, no icons or color-coding yet, consistent with the site's existing
// restraint. `current` optionally highlights one step (e.g. for a future
// per-issue "this issue's Understand/Track/Act status" treatment) but every
// call site today omits it and just shows the plain journey.
const STEPS = ["Understand", "Track", "Act"] as const;

export default function JourneyStrip({
  current,
  className = "",
}: {
  current?: (typeof STEPS)[number];
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.15em] ${className}`}
    >
      {STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-2">
          <span className={step === current ? "text-accent-dark" : "text-ink/40"}>{step}</span>
          {i < STEPS.length - 1 && <span aria-hidden className="text-ink/20">→</span>}
        </span>
      ))}
    </div>
  );
}
