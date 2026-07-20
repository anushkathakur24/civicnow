import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import JourneyStrip from "@/components/JourneyStrip";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Our Manifesto",
  description: "Know More. Do More. Why CivicNow exists.",
};

// One idea per screen — each beat gets its own near-full-height section so a
// visitor scrolls through the manifesto a line at a time, rather than
// reading it as a wall of text. Motion is still just Reveal's plain
// fade-and-rise (see components/ui/Reveal.tsx) — no new animation system for
// this one page, matching the site's existing restraint.
function Beat({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
      <Reveal>
        {eyebrow && (
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-accent-dark">
            {eyebrow}
          </p>
        )}
        <div className="mx-auto max-w-2xl font-serif text-display-md font-medium leading-[1.15] text-ink">
          {children}
        </div>
      </Reveal>
    </section>
  );
}

export default function ManifestoPage() {
  return (
    <article>
      <Beat eyebrow="Our manifesto">Stop Scrolling.</Beat>

      <Beat>
        Every day, millions of Indians discover stories that deserve attention.
      </Beat>

      <Beat>
        <span className="block text-ink/50">
          A protest. A policy. A judgment. A promise. A crisis.
        </span>
      </Beat>

      <Beat>
        For a moment, everyone cares.
        <br />
        <span className="text-ink/50">People like. People comment. People repost.</span>
        <br />
        Then life moves on.
      </Beat>

      <Beat>
        Not because people don&apos;t care.
        <br />
        <span className="text-ink/50">Because they don&apos;t know what comes next.</span>
      </Beat>

      <Beat>
        We built CivicNow because awareness should be the beginning,
        <br />
        not the end.
      </Beat>

      <Beat>
        Every issue deserves more than a repost.
        <br />
        <span className="text-ink/50">Every citizen deserves to know how they can help.</span>
      </Beat>

      <section className="flex min-h-[85vh] flex-col items-center justify-center px-5 text-center">
        <Reveal>
          <p className="mb-2 font-serif text-display-lg font-medium leading-[1.05] text-ink">
            Know More. Do More.
          </p>
          <div className="mb-10 mt-6">
            <JourneyStrip />
          </div>
          <ButtonLink href="/#issues" variant="primary" className="px-6 py-3">
            Explore Issues
          </ButtonLink>
        </Reveal>
      </section>
    </article>
  );
}
