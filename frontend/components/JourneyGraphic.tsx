import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    step: "01",
    title: "Understand",
    copy: "The full, honestly-sourced picture — not a headline stripped of context.",
  },
  {
    step: "02",
    title: "Track",
    copy: "What's actually happened, who's responsible, and what they've done about it.",
  },
  {
    step: "03",
    title: "Act",
    copy: "One real action, matched to your time, skills, and role — not a generic ask.",
  },
] as const;

export interface JourneyGraphicLinks {
  understand?: string;
  track?: string;
  act?: string;
}

const LINK_KEYS = ["understand", "track", "act"] as const;

// The "Understand → Track → Act" journey, rendered as three connected nodes
// rather than plain caption text — this is CivicNow's core product loop, so
// it earns real visual weight wherever it appears. A single shared component
// used on the homepage, the About page, and issue pages, so the motif reads
// identically everywhere instead of being reimplemented per page.
//
// On issue pages, each step actually points to that part of the page (the
// timeline, the current-status card, the actions section) via `links` —
// pass in-page anchors (e.g. "#issue-understand") to make a step clickable;
// omit `links` (homepage, About) and it renders as plain non-interactive
// cards, since there's nothing on those pages for a step to jump to.
//
// Note: this is deliberately separate from JourneyStrip.tsx, which stays as
// the minimal text-only version used in tight spaces (site footer, the
// manifesto's closing beat) where a full graphic would be too heavy.
export default function JourneyGraphic({
  className = "",
  links,
}: {
  className?: string;
  links?: JourneyGraphicLinks;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Connector: a single line tying the three nodes into one path —
          horizontal on desktop, vertical on mobile. Fades at both ends so
          slight misalignment with the node centers never looks off. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent sm:block"
      />
      <div
        aria-hidden
        className="absolute left-6 top-6 block h-[calc(100%-3rem)] w-px bg-gradient-to-b from-transparent via-line to-transparent sm:hidden"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
        {STEPS.map((s, i) => {
          const href = links?.[LINK_KEYS[i]];
          const card = (
            <div className="relative flex gap-4 sm:block">
              <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-line bg-paper font-mono text-xs font-semibold text-accent-dark shadow-soft sm:mx-auto sm:mb-4">
                {s.step}
              </div>
              <div
                className={`glass flex-1 rounded-3xl border border-line/70 p-5 text-left transition-all duration-300 sm:p-6 sm:text-center ${
                  href ? "group-hover:-translate-y-0.5 group-hover:shadow-glow-sm group-focus-visible:-translate-y-0.5 group-focus-visible:shadow-glow-sm" : "hover:-translate-y-0.5 hover:shadow-glow-sm"
                }`}
              >
                <h3 className="mb-1.5 font-serif text-lg font-medium text-ink sm:text-xl">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink/55">{s.copy}</p>
              </div>
            </div>
          );
          return (
            <Reveal key={s.step} delay={0.08 * i}>
              {href ? (
                <a
                  href={href}
                  className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark/50"
                  aria-label={`Jump to "${s.title}" on this page`}
                >
                  {card}
                </a>
              ) : (
                card
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
