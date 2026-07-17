import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/90",
  secondary: "border border-line bg-white text-ink hover:border-ink/25 hover:bg-mist/60",
  ghost: "text-ink/70 hover:text-ink hover:bg-mist/60",
};

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </Link>
  );
}
