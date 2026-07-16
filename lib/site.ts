export const siteConfig = {
  name: "HeyLanguages",
  domain: "https://heylanguages.com",
  productName: "HeyYusuf",
  supportEmail: "dev@heylanguages.com",
  description:
    "Practical, friendly language-learning apps built around useful real-world communication.",
  androidLaunchStatus: "Launching first on Android.",
  googlePlayUrl: null as string | null,
  legalLastUpdated: "2026-07-16",
  routes: {
    home: "/",
    heyyusuf: "/heyyusuf",
    privacy: "/heyyusuf/privacy",
    terms: "/heyyusuf/terms",
    support: "/heyyusuf/support",
    deleteAccount: "/heyyusuf/delete-account",
  },
  legal: {
    privacy: "https://heylanguages.com/heyyusuf/privacy",
    terms: "https://heylanguages.com/heyyusuf/terms",
    support: "https://heylanguages.com/heyyusuf/support",
    deleteAccount: "https://heylanguages.com/heyyusuf/delete-account",
  },
  social: {
    title: "HeyLanguages",
    description:
      "Language learning for real conversations. Discover HeyYusuf, a practical Arabic-learning mobile app.",
    image: "/opengraph-image",
  },
};

export const publicRoutes = [
  siteConfig.routes.home,
  siteConfig.routes.heyyusuf,
  siteConfig.routes.privacy,
  siteConfig.routes.terms,
  siteConfig.routes.support,
  siteConfig.routes.deleteAccount,
];

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.domain).toString();
}

export function mailtoSupport(subject = "HeyYusuf Support") {
  return `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(subject)}`;
}
