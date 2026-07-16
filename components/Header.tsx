import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ButtonLink } from "./ButtonLink";

const navItems = [
  { href: siteConfig.routes.heyyusuf, label: "HeyYusuf" },
  { href: siteConfig.routes.support, label: "Support" },
  { href: siteConfig.routes.privacy, label: "Privacy" },
  { href: siteConfig.routes.terms, label: "Terms" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/86 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link
          aria-label="HeyLanguages home"
          className="flex min-h-11 items-center gap-3 rounded-full"
          href={siteConfig.routes.home}
        >
          <span className="grid size-10 place-items-center rounded-lg border border-amber/35 bg-amber/15 text-lg font-bold text-amber">
            هـ
          </span>
          <span className="font-semibold tracking-wide text-cream">
            HeyLanguages
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <Link
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-cream/6 hover:text-cream"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink href={siteConfig.routes.heyyusuf}>Explore HeyYusuf</ButtonLink>
        </div>

        <details className="group relative md:hidden">
          <summary
            aria-label="Open navigation menu"
            className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-cream"
          >
            Menu
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 mt-3 w-64 rounded-lg border border-line bg-panel p-3 shadow-soft"
          >
            {navItems.map((item) => (
              <Link
                className="block rounded-lg px-4 py-3 text-sm font-medium text-muted hover:bg-cream/6 hover:text-cream"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink
              className="mt-2 flex justify-center text-center"
              href={siteConfig.routes.heyyusuf}
            >
              Explore HeyYusuf
            </ButtonLink>
          </nav>
        </details>
      </div>
    </header>
  );
}
