"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Micro-interaction, not a spectacle: a small fade + rise as sections enter
// the viewport. `once` so re-scrolling past a section never re-triggers it —
// motion here is meant to be noticed once, not performed on every scroll.
const VIEWPORT = { once: true, margin: "-80px" } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
}) {
  if (as === "section") {
    return (
      <motion.section
        className={className}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, delay, ease: EASE }}
      >
        {children}
      </motion.section>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
