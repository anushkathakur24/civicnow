import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export const metadata = { title: "About" };

const GITHUB_URL = "https://github.com/anushkathakur24/civicnow";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Reveal>
        <h1 className="mb-1 font-serif text-display-sm font-medium text-ink">About CivicNow</h1>
        <p className="mb-10 text-sm text-ink/55">Why this exists, and what it isn&apos;t.</p>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mb-10 space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            Most civic news disappears the moment the news cycle moves on. A promise gets made, it
            gets covered for a week, and then there&apos;s no easy way to find out later whether
            anything actually happened. CivicNow exists to hold a small number of issues open —
            tracking what was promised, what was delivered, and what a person can concretely do
            about it — for as long as it takes, not just for a news cycle.
          </p>
          <p>
            It is an independent project, not affiliated with any government body, political party,
            or NGO named on this site. It doesn&apos;t run ads and doesn&apos;t sell data. It is
            currently small and in early access by design — a handful of issues, tracked carefully,
            rather than a large database tracked carelessly.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mb-10 rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">What CivicNow is not</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-ink/65">
            <li>Not a news outlet — it doesn&apos;t break stories, it tracks their aftermath.</li>
            <li>Not a petition site — actions here are meant to be verifiable, not just clicks.</li>
            <li>Not neutral about accuracy — sources are shown so you can check the work, not asked to trust a badge.</li>
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="mb-10 space-y-3 text-[15px] leading-relaxed text-ink/75">
          <h2 className="font-serif text-lg font-medium text-ink">How it&apos;s built</h2>
          <p>
            CivicNow is built and maintained by a small, independent team. We&apos;re not listing
            individual names on this page yet — the project is early enough that we&apos;d rather be
            judged on the sourcing and the code than on a bio. The code itself is public:
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-dark hover:underline"
          >
            View the source on GitHub →
          </a>
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="rounded-2xl border border-line bg-mist/40 p-5 text-sm leading-relaxed text-ink/60">
          Want to know how we decide what counts as a verified source, or how the Impact Score
          works? See the{" "}
          <Link href="/methodology" className="font-medium text-accent-dark hover:underline">
            methodology page
          </Link>
          .
        </div>
      </Reveal>
    </div>
  );
}
