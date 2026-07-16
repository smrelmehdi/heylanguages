import Link from "next/link";
import { mailtoSupport, siteConfig } from "@/lib/site";

const footerLinks = [
  { href: siteConfig.routes.heyyusuf, label: "HeyYusuf" },
  { href: siteConfig.routes.support, label: "Support" },
  { href: siteConfig.routes.privacy, label: "Privacy Policy" },
  { href: siteConfig.routes.terms, label: "Terms of Use" },
  { href: siteConfig.routes.deleteAccount, label: "Delete Account" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-cream">HeyLanguages</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Practical, friendly language-learning apps built around useful
            real-world communication.
          </p>
          <p className="mt-4 text-sm text-muted">
            HeyYusuf is a product of HeyLanguages.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            {footerLinks.map((link) => (
              <Link
                className="text-sm text-muted underline-offset-4 hover:text-cream hover:underline"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-cream">Contact</p>
            <a
              className="mt-2 inline-block text-sm text-muted underline-offset-4 hover:text-cream hover:underline"
              href={mailtoSupport()}
            >
              dev@heylanguages.com
            </a>
            <p className="mt-6 text-xs text-muted/80">© {year} HeyLanguages.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
