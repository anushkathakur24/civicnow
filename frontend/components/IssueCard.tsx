import Link from "next/link";
import { IssueSummary } from "@/lib/api";

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-700",
};

export default function IssueCard({ issue }: { issue: IssueSummary }) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className="block rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
            URGENCY_STYLES[issue.urgency] || URGENCY_STYLES.low
          }`}
        >
          {issue.urgency}
        </span>
        <span className="text-xs text-ink/50">{issue.category}</span>
      </div>
      <h3 className="mb-1.5 text-lg font-semibold text-ink">{issue.title}</h3>
      <p className="line-clamp-3 text-sm text-ink/70">{issue.summary}</p>
      <span className="mt-3 inline-block text-sm font-medium text-teal">See how you can help →</span>
    </Link>
  );
}
