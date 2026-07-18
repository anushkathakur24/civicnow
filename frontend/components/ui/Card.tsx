import type { HTMLAttributes, ReactNode } from "react";

// The one card primitive the whole product shares — floating, soft-shadowed,
// generously rounded. Every "list of things" surface (issues, actions,
// sources, NGOs) composes this instead of re-declaring border/radius/shadow
// utilities inline, which is how the UI drifted into "dashboard" territory
// before.
export default function Card({
  children,
  className = "",
  hover = false,
  glow = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; hover?: boolean; glow?: boolean }) {
  // `glow` swaps the hover shadow for the warm accent halo (shadow-glow) plus
  // a faint accent-tinted border — opt-in, reserved for surfaces where a
  // little more presence on hover earns its keep (issue cards), not a
  // blanket change to every Card usage (actions, NGOs, sources, etc.).
  const hoverClass = hover
    ? `transition-all duration-300 hover:-translate-y-0.5 ${
        glow ? "hover:shadow-glow hover:border-accent/25" : "hover:shadow-soft-lg"
      }`
    : "";
  return (
    <div
      className={`rounded-3xl border border-line bg-white p-6 shadow-soft ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
