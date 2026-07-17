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
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; hover?: boolean }) {
  return (
    <div
      className={`rounded-3xl border border-line bg-white p-6 shadow-soft ${
        hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
