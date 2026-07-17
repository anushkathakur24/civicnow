import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import IssueActions from "./IssueActions";

export const revalidate = 60;

async function getIssue(id: string) {
  try {
    return await api.getIssue(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const issue = await getIssue(params.id);
  if (!issue) return { title: "Issue not found" };
  return {
    title: issue.title,
    description: issue.summary,
    openGraph: { title: issue.title, description: issue.summary },
  };
}

export default async function IssuePage({ params }: { params: { id: string } }) {
  const issue = await getIssue(params.id);
  if (!issue) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="mb-2 inline-block text-xs font-semibold uppercase text-ink/50">{issue.category}</span>
      <h1 className="mb-3 text-3xl font-bold text-ink">{issue.title}</h1>
      <p className="mb-6 text-ink/70">{issue.summary}</p>

      {issue.sensitive_note && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {issue.sensitive_note}
        </div>
      )}

      {issue.current_ask && (
        <div className="mb-6 rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase text-ink/50">Current ask</h2>
          <p className="text-ink/80">{issue.current_ask}</p>
        </div>
      )}

      {issue.timeline.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-ink">Timeline</h2>
          <ol className="space-y-3 border-l border-black/10 pl-4">
            {issue.timeline.map((t, i) => (
              <li key={i}>
                <div className="text-xs font-medium text-teal">{t.event_date}</div>
                <div className="text-sm text-ink/80">{t.event_text}</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {issue.responsible_bodies.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-ink">Responsible bodies</h2>
          <ul className="list-inside list-disc text-sm text-ink/80">
            {issue.responsible_bodies.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      <IssueActions issueId={issue.id} />

      {issue.sources.length > 0 && (
        <div className="mt-10 border-t border-black/10 pt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase text-ink/50">Sources</h2>
          <ul className="space-y-1 text-sm">
            {issue.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
