import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { ButtonLink } from "./ButtonLink";
import { MobileMenu } from "./MobileMenu";

const navItems = [
  { href: siteConfig.routes.heyyusuf, label: "HeyYusuf" },
  { href: siteConfig.routes.approach, label: "Our approach" },
  { href: siteConfig.routes.support, label: "Support" },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <BrandMark />
        <nav aria-label="Main navigation" className="desktop-nav">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="desktop-cta">
          <ButtonLink href={siteConfig.routes.heyyusuf}>Explore HeyYusuf</ButtonLink>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
