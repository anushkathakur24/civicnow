import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import JourneyGraphic from "@/components/JourneyGraphic";
import FounderCard from "@/components/FounderCard";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "About" };

// A small line illustration for the hero's visual half: reel → arrow →
// checkmark, i.e. "saw it on a reel → did something real about it." Kept to
// the same monochrome/accent palette as the rest of the site — texture, not
// decoration.
function SeenToDoneIllustration() {
  return (
    <div className="relative flex items-center justify-center gap-3 sm:gap-4">
      <div aria-hidden className="glow-orb pointer-events-none absolute -z-10 h-56 w-56" />
      <div className="glass flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-3xl border border-line/70 shadow-soft sm:h-24 sm:w-24">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-ink/50">
          <rect x="3" y="2" width="18" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 9.5v5l4-2.5-4-2.5z" fill="currentColor" />
        </svg>
        <span className="text-[9px] font-medium uppercase tracking-wide text-ink/35">Saw it</span>
      </div>

      <svg width="28" height="16" viewBox="0 0 28 16" fill="none" className="flex-shrink-0 text-ink/25">
        <path d="M1 8h24M20 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="glass flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-3xl border border-teal/25 shadow-glow-sm sm:h-24 sm:w-24">
        <svg width="26" height="26" viewBox="0 0 20 20" fill="none" className="text-teal">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 10.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[9px] font-medium uppercase tracking-wide text-teal/70">Did something</span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      {/* ---- Hero: split column, headline + opening argument on one side,
          a small visual on the other — breaks the single-column wall the
          rest of the page used to open with. ---- */}
      <section className="bg-dot-grid relative mx-auto max-w-4xl overflow-hidden px-5 pb-14 pt-16 sm:pt-20">
        <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[1.2fr_1fr] sm:gap-8">
          <Reveal>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
              Know More. Do More.
            </p>
            <h1 className="mb-6 font-serif text-display-md font-medium leading-[1.1] text-ink">
              Why CivicNow Exists
            </h1>
            <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
              <p>
                Millions of young Indians discover important public issues through Instagram Reels, X,
                YouTube Shorts, or WhatsApp.
              </p>
              <p>
                They care. They repost. Then they move on — not because they don&apos;t want to help,
                but because they don&apos;t know how.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center sm:justify-end">
            <SeenToDoneIllustration />
          </Reveal>
        </div>
      </section>

      {/* ---- The turn: the one-line thesis, given room to breathe on its
          own rather than sitting inside the same paragraph block. ---- */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-xl px-5 py-14 text-center sm:py-20">
          <p className="mb-5 font-serif text-2xl font-medium leading-snug text-ink sm:text-3xl">
            Every issue deserves more than a repost.
          </p>
          <p className="text-[15px] leading-relaxed text-ink/70">
            CivicNow bridges the gap between awareness and action by helping every citizen
            understand what&apos;s happening, track what changes, and take meaningful action.
          </p>
        </section>
      </Reveal>

      {/* ---- Understand → Track → Act, as a real graphic now — shared with
          the homepage rather than reimplemented here. ---- */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
        <JourneyGraphic />
      </section>

      {/* ---- Positioning: independent, small by design ---- */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-xl px-5 pb-14 text-center sm:pb-20">
          <p className="text-sm leading-relaxed text-ink/65">
            It is an independent project, not affiliated with any government body, political party,
            or NGO named on this site. It doesn&apos;t run ads and doesn&apos;t sell data. It is
            currently small and in early access by design — a handful of issues, tracked carefully,
            rather than a large database tracked carelessly.
          </p>
        </section>
      </Reveal>

      {/* ---- What CivicNow is not: kept prominent — this is core
          positioning, not a footnote. ---- */}
      <Reveal delay={0.05}>
        <section className="mx-auto mb-16 max-w-2xl px-5 sm:mb-24">
          <div className="rounded-4xl border border-accent/15 bg-gradient-to-br from-mist/60 to-white p-7 shadow-soft sm:p-9">
            <h2 className="mb-4 font-serif text-xl font-medium text-ink sm:text-2xl">What CivicNow is not</h2>
            <ul className="space-y-2.5 text-[15px] leading-relaxed text-ink/70">
              <li>Not a news outlet — it doesn&apos;t break stories, it tracks their aftermath.</li>
              <li>Not a petition site — actions here are meant to be verifiable, not just clicks.</li>
              <li>Not neutral about accuracy — sources are shown so you can check the work, not asked to trust a badge.</li>
            </ul>
          </div>
        </section>
      </Reveal>

      {/* ---- Methodology/manifesto pointer: deliberately quiet — a
          footnote to more information, not a claim of its own. ---- */}
      <div className="mx-auto mb-14 max-w-2xl px-5 sm:mb-20">
        <p className="border-t border-line pt-4 text-xs leading-relaxed text-ink/65">
          Want to know how we decide what counts as a verified source, or how the Impact Score
          works? See the{" "}
          <Link href="/methodology" className="font-medium text-ink/75 hover:text-accent-dark hover:underline">
            methodology page
          </Link>
          . Or read the{" "}
          <Link href="/manifesto" className="font-medium text-ink/75 hover:text-accent-dark hover:underline">
            full manifesto
          </Link>
          .
        </p>
      </div>

      {/* ---- Founder note: the one place a real person, not "the
          platform," speaks — warmer tone, distinct card, avatar, real
          contact links, on purpose. ---- */}
      <Reveal delay={0.05}>
        <section className="mx-auto mb-16 max-w-2xl px-5 sm:mb-24">
          <FounderCard
            name="Anushka Thakur"
            initials="AT"
            paragraphs={[
              "Hi, I'm Anushka Thakur.",
              "I'm in my final year of engineering (IT), and I got tired of watching myself scroll past things I cared about and do nothing. I don't have a big team or a big budget behind this — just a tech background, and a decision to stop waiting for someone else to build the thing I wished existed.",
              "CivicNow is me acting on that. It's early, it's imperfect, and I'm building it in the open. If you want to help, push back on something, or just tell me what's broken — reach out.",
            ]}
            links={[
              { kind: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/thakur-anushka" },
              { kind: "email", label: "Email", href: "mailto:anushkthakur24@gmail.com" },
            ]}
          />
        </section>
      </Reveal>

      {/* ---- Close with momentum, not silence. ---- */}
      <Reveal delay={0.08}>
        <section className="mx-auto mb-20 max-w-xl px-5 text-center sm:mb-28">
          <p className="mb-5 text-sm text-ink/65">Ready to see what&apos;s actually happening?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/#issues" variant="primary" className="px-6 py-3">
              See the issues
            </ButtonLink>
            <ButtonLink href="/manifesto" variant="secondary" className="px-6 py-3">
              Read the manifesto
            </ButtonLink>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
