import Link from "next/link";
import { mailtoSupport, siteConfig } from "@/lib/site";
import { heyYusufNavItems } from "@/lib/navigation";
import { BrandMark } from "./BrandMark";

const productLinks = [
  { href: siteConfig.routes.audioDemo, label: "Try the audio sample" },
  { href: siteConfig.routes.approach, label: "Our approach" },
  { href: siteConfig.routes.blog, label: "Blog" },
];

const helpLinks = [
  { href: siteConfig.routes.support, label: "Support" },
  { href: siteConfig.routes.privacy, label: "Privacy Policy" },
  { href: siteConfig.routes.terms, label: "Terms of Use" },
  { href: siteConfig.routes.deleteAccount, label: "Delete Account" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__intro">
          <BrandMark footer />
          <p>Friendly guides for the conversations you want to have.</p>
          <p className="site-footer__arabic" dir="rtl" lang="ar">
            أهلاً وسهلاً
          </p>
        </div>

        <div className="site-footer__links">
          <div>
            <p className="site-footer__label">HeyYusuf / Learn Arabic</p>
            {heyYusufNavItems.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label === "Overview" ? "HeyYusuf Overview" : link.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="site-footer__label">Explore</p>
            {productLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="site-footer__label">Help & legal</p>
            {helpLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="site-footer__label">Contact</p>
            <a href={mailtoSupport()}>{siteConfig.supportEmail}</a>
            <p className="site-footer__small">
              HeyYusuf is a product of HeyLanguages.
            </p>
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <p>© {year} HeyLanguages.</p>
        <p>Language learning for real conversations.</p>
      </div>
    </footer>
  );
}
