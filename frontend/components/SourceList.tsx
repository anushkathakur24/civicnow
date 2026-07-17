import { SourceItem } from "@/lib/api";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Every source gets a real, derived domain (from the actual URL — never a
// guessed or fabricated publisher name/logo) and a direct link to the
// original. No invented "verification" iconography beyond what's true: this
// is where the fact came from, go read it yourself.
export default function SourceList({ sources }: { sources: SourceItem[] }) {
  if (sources.length === 0) {
    return <p className="text-sm text-ink/40">No sources recorded for this issue yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sources.map((s, i) => {
        const domain = domainOf(s.url);
        return (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-2xl border border-line bg-white p-4 transition-colors duration-200 hover:border-accent/40 hover:bg-accent-soft/20"
            >
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-mist text-xs font-semibold uppercase text-ink/50">
                {domain.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink group-hover:text-accent-dark">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-xs text-ink/40">{domain}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
