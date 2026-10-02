import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark" | "text";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link className={`button button--${variant} ${className}`} href={href}>
      <span>{children}</span>
      {variant !== "text" ? (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M4 10h11M11 5l5 5-5 5" />
        </svg>
      ) : null}
    </Link>
  );
}
