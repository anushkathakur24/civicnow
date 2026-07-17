import Link from "next/link";
import { IssueSummary } from "@/lib/api";
import Card from "@/components/ui/Card";
import Chip, { ChipTone } from "@/components/ui/Chip";

const URGENCY_TONE: Record<string, ChipTone> = {
  critical: "red",
  high: "accent",
  medium: "amber",
  low: "neutral",
};

export default function IssueCard({ issue }: { issue: IssueSummary }) {
  return (
    <Link href={`/issues/${issue.id}`} className="block">
      <Card hover className="h-full">
        <div className="mb-3 flex items-center gap-2">
          <Chip tone={URGENCY_TONE[issue.urgency] || "neutral"}>{issue.urgency}</Chip>
          <span className="text-xs text-ink/45">{issue.category}</span>
        </div>
        <h3 className="mb-2 font-serif text-lg font-medium leading-snug tracking-tight text-ink">
          {issue.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink/60">{issue.summary}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-medium text-accent-dark">See how you can help →</span>
          <span className="text-[11px] text-ink/35">
            Updated {new Date(issue.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </Card>
    </Link>
  );
}
