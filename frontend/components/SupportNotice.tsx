import { SUPPORT_RESOURCES } from "@/lib/supportResources";

// A visually calm, distinct callout — teal (the site's existing
// "trustworthy/supportive" color), not red or amber, and deliberately
// separate from the factual timeline and the "How you can help" action
// section. Renders only when the issue is flagged `sensitive_content` AND
// `support_note_visible` (see app/issues/[id]/page.tsx) — never shown by
// default, and never depends on someone remembering to hand-author a
// crisis line on a specific issue.
export default function SupportNotice({
  context,
  className = "",
}: {
  context?: string | null;
  className?: string;
}) {
  return (
    <div className={`glass rounded-3xl border border-teal/20 bg-teal/[0.04] p-6 text-left ${className}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 17.5s-6.5-4.02-8.5-8.02C.36 6.6 1.6 3.5 4.5 3c1.9-.33 3.6.6 4.5 2.1C9.9 3.6 11.6 2.67 13.5 3c2.9.5 4.14 3.6 3 6.48-2 4-8.5 8.02-8.5 8.02z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="font-serif text-lg font-medium text-ink">Need support?</h2>
      </div>

      {context && <p className="mb-3 text-sm leading-relaxed text-ink/60">{context}</p>}

      <p className="mb-4 text-sm leading-relaxed text-ink/65">
        Some public issues discussed on CivicNow may involve distressing topics, including suicide,
        self-harm, or violence. If you or someone you know needs emotional support, confidential
        help is available:
      </p>

      <ul className="space-y-1.5">
        {SUPPORT_RESOURCES.map((r) => (
          <li key={r.name} className="flex flex-wrap items-baseline gap-x-1.5 text-sm text-ink/75">
            <span className="text-teal">•</span>
            <span className="font-medium text-ink">{r.name}:</span>
            <span className="font-mono text-[13px] text-ink/70">{r.detail}</span>
            <span className="text-xs text-ink/45">({r.hours})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
