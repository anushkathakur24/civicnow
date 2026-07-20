import type { HelpAction } from "@/lib/api";
import Card from "@/components/ui/Card";
import { sourcedBadgeClass } from "@/components/ui/SourcedBadge";
import { domainOf } from "@/lib/url";

// The general, issue-level "how you can help" layer — grounded, sourced,
// concrete actions anyone can take, distinct from the role-matched action
// engine (IssueActions.tsx) that renders beneath it on the issue page. Every
// entry here comes from the backend's `help_actions` field, which only ever
// contains rows with at least one real source_url — see HelpAction model
// docstring and CONTENT_GUIDELINES.md. This component has no fallback
// "generic action" text: if `actions` is empty, it renders nothing rather
// than inventing something to fill the space.
const TYPE_LABEL: Record<string, string> = {
  amplify: "Amplify",
  petition: "Sign & Share",
  contact: "Contact a Representative",
  physical: "Show Up",
  donate: "Donate",
  volunteer: "Volunteer",
  monitor: "Monitor & File RTI",
};

function TypeIcon({ type }: { type: string }) {
  const common = { width: 14, height: 14, viewBox: "0 0 20 20", fill: "none" } as const;
  switch (type) {
    case "amplify":
      return (
        <svg {...common}>
          <path d="M3 8v4h3l5 4V4L6 8H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M14.5 7a3.5 3.5 0 010 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "petition":
      return (
        <svg {...common}>
          <path d="M5 3h7l3 3v11a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "contact":
      return (
        <svg {...common}>
          <path d="M3 5.5A1.5 1.5 0 014.5 4h2.1l1.4 3.5-1.6 1.2a9 9 0 004.9 4.9l1.2-1.6L16 13.4v2.1a1.5 1.5 0 01-1.5 1.5C7.5 17 3 12.5 3 5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "physical":
      return (
        <svg {...common}>
          <path d="M10 17.5S4 12.8 4 8.2a6 6 0 1112 0c0 4.6-6 9.3-6 9.3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="10" cy="8.2" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "donate":
      return (
        <svg {...common}>
          <path d="M10 17s-6.5-4-8.5-8C.4 6 1.6 3 4.5 2.5c1.9-.3 3.6.6 4.5 2.1.9-1.5 2.6-2.4 4.5-2.1 2.9.5 4.1 3.5 3 6-2 4-8.5 8-8.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "volunteer":
      return (
        <svg {...common}>
          <circle cx="10" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function HelpActions({ actions }: { actions: HelpAction[] }) {
  if (actions.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent-dark">
          Grounded in what&apos;s happening
        </p>
        <h2 className="mb-2 font-serif text-display-sm font-medium text-ink">How you can help</h2>
        <p className="mx-auto max-w-md text-sm text-ink/55">
          Concrete, sourced actions anyone can take right now, not a generic ask.
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((a, i) => (
          <Card key={i} className="p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-ink/50">
                <TypeIcon type={a.action_type} />
              </span>
              <h3 className="font-medium text-ink">{a.title}</h3>
              <span className="ml-auto hidden text-[10px] font-medium uppercase tracking-wide text-ink/30 sm:inline">
                {TYPE_LABEL[a.action_type] || a.action_type}
              </span>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-ink/65">{a.description}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {a.source_urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${sourcedBadgeClass("neutral")} hover:border-accent/40 hover:text-accent-dark`}
                >
                  {domainOf(url)}
                </a>
              ))}
              <span className="ml-auto text-[11px] text-ink/35">
                Verified{" "}
                {new Date(a.last_verified).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
