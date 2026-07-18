// A distinct, warmer card style reserved for the one place on the site where
// a real person — not "the platform" — speaks directly. Built as its own
// component (not inlined in the About page) so the same pattern is available
// if CivicNow ever adds more voices later, without redesigning from scratch.

export type FounderLinkKind = "linkedin" | "github" | "email";

export interface FounderLink {
  kind: FounderLinkKind;
  label: string;
  href: string;
}

const ICONS: Record<FounderLinkKind, React.ReactNode> = {
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.01-4.12 2.06 2.06 0 01-.01 4.12zM7.11 20.45H3.56V9h3.55v11.45z" />
    </svg>
  ),
  github: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.36 9.36 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0022 12.2C22 6.58 17.52 2 12 2z"
      />
    </svg>
  ),
  email: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9zM4 5.7v.3l6 3.75L16 6v-.3L10 9.5 4 5.7zm0 2.1v6.2h12V7.8l-5.68 3.55a.75.75 0 01-.64 0L4 7.8z" />
    </svg>
  ),
};

export default function FounderCard({
  name,
  initials,
  paragraphs,
  links,
}: {
  name: string;
  initials: string;
  paragraphs: string[];
  links: FounderLink[];
}) {
  return (
    <div className="rounded-4xl border border-accent/20 bg-gradient-to-br from-accent-soft/50 to-white p-7 shadow-soft sm:p-9">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent-dark font-serif text-lg font-medium text-paper shadow-glow-sm">
          {initials}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">Who&apos;s building this</p>
          <p className="font-serif text-lg font-medium text-ink">{name}</p>
        </div>
      </div>

      <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.kind}
              href={l.href}
              target={l.kind === "email" ? undefined : "_blank"}
              rel={l.kind === "email" ? undefined : "noopener noreferrer"}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors duration-200 hover:border-accent-dark/40 hover:text-accent-dark"
            >
              {ICONS[l.kind]}
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
