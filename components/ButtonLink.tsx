import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const styles = {
    primary:
      "min-h-11 rounded-full bg-amber px-5 py-3 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-[#e5aa51]",
    secondary:
      "min-h-11 rounded-full border border-line bg-cream/5 px-5 py-3 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:border-amber/60 hover:bg-cream/10",
    text:
      "inline-flex min-h-11 items-center rounded-full px-2 py-3 text-sm font-semibold text-amber underline-offset-4 transition hover:text-cream hover:underline",
  };

  return (
    <Link className={`${styles[variant]} ${className}`} href={href}>
      {children}
    </Link>
  );
}
