import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import JourneyStrip from "@/components/JourneyStrip";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Reveal>
        <h1 className="mb-1 font-serif text-display-sm font-medium text-ink">Why CivicNow Exists</h1>
        <p className="mb-10 text-sm text-ink/55">Know More. Do More.</p>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mb-8 space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            Millions of young Indians discover important public issues through Instagram Reels, X,
            YouTube Shorts, or WhatsApp.
          </p>
          <p>
            They care. They repost. Then they move on — not because they don&apos;t want to help,
            but because they don&apos;t know how.
          </p>
          <p className="font-serif text-lg font-medium text-ink">
            Every issue deserves more than a repost.
          </p>
          <p>
            CivicNow bridges the gap between awareness and action by helping every citizen
            understand what&apos;s happening, track what changes, and take meaningful action.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mb-10">
          <JourneyStrip />
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="mb-10 space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            It is an independent project, not affiliated with any government body, political party,
            or NGO named on this site. It doesn&apos;t run ads and doesn&apos;t sell data. It is
            currently small and in early access by design — a handful of issues, tracked carefully,
            rather than a large database tracked carelessly.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="mb-10 rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">What CivicNow is not</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-ink/65">
            <li>Not a news outlet — it doesn&apos;t break stories, it tracks their aftermath.</li>
            <li>Not a petition site — actions here are meant to be verifiable, not just clicks.</li>
            <li>Not neutral about accuracy — sources are shown so you can check the work, not asked to trust a badge.</li>
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.18}>
        <section className="mb-10 space-y-3 text-[15px] leading-relaxed text-ink/75">
          <h2 className="font-serif text-lg font-medium text-ink">Who&apos;s building this</h2>
          <p>Built by Anushka Thakur.</p>
        </section>
      </Reveal>

      <Reveal delay={0.22}>
        <div className="rounded-2xl border border-line bg-mist/40 p-5 text-sm leading-relaxed text-ink/60">
          Want to know how we decide what counts as a verified source, or how the Impact Score
          works? See the{" "}
          <Link href="/methodology" className="font-medium text-accent-dark hover:underline">
            methodology page
          </Link>
          . Or read the{" "}
          <Link href="/manifesto" className="font-medium text-accent-dark hover:underline">
            full manifesto
          </Link>
          .
        </div>
      </Reveal>
    </div>
  );
}
