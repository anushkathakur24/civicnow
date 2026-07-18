/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm, quiet neutrals (Granola-esque) instead of stark black/white —
        // "ink" is a soft charcoal, not #000, so the whole UI reads calmer.
        ink: "#18160F",
        paper: "#FBF9F4",
        mist: "#F1EDE4",
        line: "#E7E1D4",
        // Single warm accent (charity: water-esque optimism) used sparingly
        // and only for primary actions / hope-forward moments — not a literal
        // copy of their brand yellow, shifted warmer/deeper so it reads as
        // "CivicNow gold" rather than a clone.
        accent: {
          DEFAULT: "#D97F2E",
          soft: "#F6E4CC",
          dark: "#B5651E",
        },
        // Kept from the existing system: teal means exactly one thing —
        // verified / trustworthy — never used decoratively.
        teal: "#0E7C7B",
        saffron: "#FF6A39",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        // Reserved for small "data tag" moments (category labels, point
        // values, source badges) — a monospace accent borrowed from
        // security/data-dashboard UI, used sparingly as texture, never for
        // body copy or headlines.
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // A slightly wider display scale so headlines can carry the page
        // the way Granola/charity: water use type as the hero, not chrome.
        "display-lg": ["clamp(2.75rem, 6vw, 4.5rem)", { lineHeight: "1.04", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2.1rem, 4vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
        "display-sm": ["clamp(1.5rem, 2.5vw, 1.875rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(24,22,15,0.04), 0 10px 30px -12px rgba(24,22,15,0.10)",
        "soft-lg": "0 2px 4px rgba(24,22,15,0.05), 0 24px 48px -16px rgba(24,22,15,0.16)",
        // Warm accent halo — the "glow" the reference uses on hover/focus,
        // adapted to the light palette: a soft amber bloom, not a neon ring.
        glow: "0 0 0 1px rgba(217,127,46,0.16), 0 16px 40px -14px rgba(217,127,46,0.4)",
        "glow-sm": "0 0 0 1px rgba(217,127,46,0.14), 0 8px 22px -10px rgba(217,127,46,0.3)",
        // Cool-secondary glow reserved for trust/verification moments (NGO
        // verified badge, sourced tags) — teal, never decorative.
        "glow-teal": "0 0 0 1px rgba(14,124,123,0.16), 0 12px 30px -12px rgba(14,124,123,0.3)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      maxWidth: {
        prose: "42rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
