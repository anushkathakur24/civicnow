import { api } from "@/lib/api";
import IssueCard from "@/components/IssueCard";
import StatsBar from "@/components/StatsBar";
import RandomLetterSwap from "@/components/RandomLetterSwap";
import Link from "next/link";

export const revalidate = 60; // ISR: re-fetch issue list from the API at most once a minute

export default async function HomePage() {
  let issues: Awaited<ReturnType<typeof api.listIssues>> = [];
  let apiError = false;
  try {
    issues = await api.listIssues();
  } catch {
    apiError = true;
  }

  const flagship = issues.find((i) => i.urgency === "critical") || issues[0];

  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pb-8 pt-16 text-center">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Know what&apos;s happening.{" "}
          <span className="text-saffron">
            <RandomLetterSwap text="Do something verified about it." />
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-ink/70">
          CivicNow tracks India&apos;s most urgent civic issues and matches you to real actions
          based on who you are — content creator, professional, official, or citizen. Every action
          builds a fraud-resistant Impact Score.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="#issues" className="rounded-full bg-ink px-6 py-3 font-medium text-white hover:opacity-90">
            <RandomLetterSwap text="See active issues" />
          </Link>
          <Link href="/register" className="rounded-full border border-ink/20 px-6 py-3 font-medium text-ink hover:bg-ink/5">
            <RandomLetterSwap text="Start your Impact Score" />
          </Link>
        </div>
      </section>

      <StatsBar
        stats={[
          { label: "Active Issues", value: apiError ? "—" : String(issues.length) },
          { label: "Citizens Taking Action", value: "18,420" },
          { label: "Verified NGOs", value: "96" },
          { label: "Government Responses Tracked", value: "42" },
        ]}
      />

      {apiError && (
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          Couldn&apos;t reach the CivicNow API right now. Showing a cached-style page — try refreshing shortly.
        </div>
      )}

      {flagship && (
        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-orange-50 to-white p-8">
            <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
              Urgent
            </span>
            <h2 className="mb-2 text-2xl font-bold text-ink">{flagship.title}</h2>
            <p className="mb-4 text-ink/70">{flagship.summary}</p>
            <Link href={`/issues/${flagship.id}`} className="font-medium text-teal hover:underline">
              Read the full timeline and take action →
            </Link>
          </div>
        </section>
      )}

      <section id="issues" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-ink">Active issues</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
        {issues.length === 0 && !apiError && (
          <p className="text-ink/60">No published issues yet.</p>
        )}
      </section>
    </div>
  );
}
