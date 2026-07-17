"use client";

// Hover-triggered letter-scramble effect, ported to a real TSX component now that
// the project has an actual framer-motion + TypeScript build (originally prototyped
// as vanilla JS/CSS in the static HTML mockup — see CivicNow_Design_Critique.md).
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sampleSize } from "lodash";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function randomChar(): string {
  return sampleSize(CHARS.split(""), 1)[0];
}

interface RandomLetterSwapProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function RandomLetterSwap({ text, className, as = "span" }: RandomLetterSwapProps) {
  const [hovered, setHovered] = useState(false);
  const Tag = as as any;

  return (
    <Tag
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "inline-flex" }}
    >
      {text.split("").map((char, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={hovered ? `scramble-${i}-${Math.random()}` : `still-${i}`}
              initial={hovered ? { opacity: 0, y: -6 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, delay: i * 0.02 }}
              style={{ display: "inline-block" }}
            >
              {char === " " ? " " : hovered ? randomChar() : char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </Tag>
  );
}
