import { siteConfig } from "./site";

// Only published pages belong in shared navigation.
export const heyYusufNavItems = [
  { href: siteConfig.routes.heyyusuf, label: "Overview" },
  { href: siteConfig.routes.features, label: "Features" },
  { href: "/heyyusuf/gulf-arabic", label: "Gulf Arabic" },
  { href: "/heyyusuf/egyptian-arabic", label: "Egyptian Arabic" },
  { href: "/heyyusuf/msa", label: "Modern Standard Arabic" },
] as const;
