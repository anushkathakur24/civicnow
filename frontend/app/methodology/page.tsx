import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export const metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Reveal>
        <h1 className="mb-1 font-serif text-display-sm font-medium text-ink">Methodology</h1>
        <p className="mb-10 text-sm text-ink/55">
          How sources are chosen, how the Impact Score is calculated, and where the limits are.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mb-10">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">How we verify sources</h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-ink/75">
            <p>
              Every fact on an issue page — a promise, a timeline event, a status — links to a
              specific source, not a general citation. We prioritise primary sources: government
              notifications, official statements, court filings, press releases from the bodies
              involved. Where a primary document isn&apos;t public, we cite reporting from named,
              identifiable outlets rather than anonymous or unsourced claims.
            </p>
            <p>
              For claims with serious real-world stakes — for example, reported deaths connected to
              an issue — we require at least two independent sources before publishing, not one.
              A single-sourced claim on a high-stakes fact is treated as unverified until a second
              source confirms it.
            </p>
            <p>We do not use anonymous tips, unverified social media posts, or AI-generated summaries as sources.</p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mb-10">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">
            &ldquo;Last updated&rdquo; vs. &ldquo;Last fact-checked&rdquo;
          </h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-ink/75">
            <p>
              <span className="font-medium text-ink">Last updated</span> changes whenever anything on
              the page changes — a new timeline event, a typo fix, a formatting change. It is not a
              claim that the facts were re-checked.
            </p>
            <p>
              <span className="font-medium text-ink">Last fact-checked</span> only changes when
              someone has deliberately gone back through the sources on that page and confirmed
              they&apos;re still accurate and still online. It&apos;s set manually, never
              automatically, so it can&apos;t drift into a false claim of freshness.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="mb-10">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">How the Impact Score works</h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-ink/75">
            <p>
              The score is computed entirely server-side from verified action submissions — nothing
              a client sends can set or inflate it directly. Three numbers combine for every action:
            </p>
            <ul className="space-y-1.5 pl-4">
              <li className="list-disc">
                <span className="font-medium text-ink">Base points by impact</span> — high-impact
                actions are worth 50 points, medium 30, low 15.
              </li>
              <li className="list-disc">
                <span className="font-medium text-ink">A trust multiplier by verification method</span>{" "}
                — self-reported actions count at 20% of base value; actions confirmed by an NGO,
                a government official, or attendance QR count at 100%. Receipt and document
                uploads sit in between.
              </li>
              <li className="list-disc">
                <span className="font-medium text-ink">Diminishing returns</span> — the same category
                of action, repeated a third time or more within a rolling 7-day window, counts at
                10% of its normal value. This is the main defence against farming the cheapest
                action type over and over.
              </li>
            </ul>
            <p>
              Anything above the lowest, self-reported trust tier sits in a{" "}
              <span className="font-medium text-ink">pending</span> state and awards zero points
              until a moderator, NGO staff member, or government verifier confirms it actually
              happened.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <section className="mb-10">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">Why new accounts wait 24 hours</h2>
          <p className="text-[15px] leading-relaxed text-ink/75">
            New accounts can&apos;t submit actions until 24 hours after registration and email
            verification. This exists purely to make disposable-account farming of the Impact Score
            slower and more expensive than it&apos;s worth — see{" "}
            <Link href="/register" className="text-accent-dark hover:underline">registration</Link>.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.25}>
        <section className="rounded-2xl border border-line bg-mist/40 p-5 text-sm leading-relaxed text-ink/60">
          <p className="mb-2 font-medium text-ink/75">Where this falls short</p>
          <p>
            This system catches obvious spam and unverifiable claims, not everything. A determined
            bad actor with real documents can still submit false information, and human reviewers can
            make mistakes. If you spot a factual error on any issue page, the sources are listed so
            you can check our work directly — that&apos;s the point of showing them.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
