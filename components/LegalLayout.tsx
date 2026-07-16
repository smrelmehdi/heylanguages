import Link from "next/link";
import type { ReactNode } from "react";
import { mailtoSupport, siteConfig } from "@/lib/site";

type TocItem = {
  id: string;
  label: string;
};

type LegalLayoutProps = {
  title: string;
  intro: string;
  toc: TocItem[];
  children: ReactNode;
};

export function LegalLayout({ title, intro, toc, children }: LegalLayoutProps) {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[16rem_1fr] md:py-20">
      <aside className="hidden md:block">
        <div className="sticky top-28 rounded-lg border border-line bg-panel/72 p-5">
          <p className="text-sm font-semibold text-cream">On this page</p>
          <nav aria-label={`${title} table of contents`} className="mt-4 grid gap-2">
            {toc.map((item) => (
              <a
                className="text-sm text-muted underline-offset-4 hover:text-cream hover:underline"
                href={`#${item.id}`}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <article className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber">
          HeyYusuf
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-cream md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{intro}</p>
        <p className="mt-4 text-sm text-muted">
          Last updated: {siteConfig.legalLastUpdated}
        </p>

        <div className="legal-content mt-10 max-w-none">
          {children}
        </div>

        <div className="mt-12 rounded-lg border border-line bg-panel/72 p-6">
          <p className="font-semibold text-cream">Related pages</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="text-sm text-amber hover:text-cream" href={siteConfig.routes.privacy}>
              Privacy Policy
            </Link>
            <Link className="text-sm text-amber hover:text-cream" href={siteConfig.routes.terms}>
              Terms of Use
            </Link>
            <Link className="text-sm text-amber hover:text-cream" href={siteConfig.routes.support}>
              Support
            </Link>
            <Link className="text-sm text-amber hover:text-cream" href={siteConfig.routes.deleteAccount}>
              Delete Account
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted">
            Questions? Contact{" "}
            <a className="text-amber hover:text-cream" href={mailtoSupport()}>
              dev@heylanguages.com
            </a>
            .
          </p>
        </div>
      </article>
    </main>
  );
}
