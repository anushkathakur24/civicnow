"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "@/lib/api";
import Chip from "@/components/ui/Chip";

// A single connecting rail with a node per event. Clicking an event expands
// it to surface the source link — reading history unfold, one confirmed
// fact at a time, rather than a wall of text up front.
export default function Timeline({ events }: { events: TimelineEvent[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ol className="relative space-y-0 border-l-2 border-line pl-7">
      {events.map((t, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.li
            key={i}
            className="relative pb-8 last:pb-0"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className={`absolute -left-[33px] top-1 h-3 w-3 rounded-full border-2 border-paper ${
                t.verified ? "bg-teal" : "bg-ink/25"
              }`}
            />
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="group flex w-full flex-col items-start text-left"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                  {new Date(t.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {t.verified && <Chip tone="teal">Sourced</Chip>}
              </div>
              <p className="text-[15px] leading-relaxed text-ink/80 transition-colors group-hover:text-ink">
                {t.event_text}
              </p>
            </button>
            {isOpen && t.source_url && (
              <a
                href={t.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink/40 transition-colors hover:text-accent-dark"
              >
                View original source
                <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                  <path d="M7 13L13 7M13 7H8M13 7V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
