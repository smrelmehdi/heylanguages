export type PlatformKey = "android" | "ios";
export type PlatformReleaseState = "coming-soon" | "available";

export type PlatformAvailability = {
  name: string;
  state: PlatformReleaseState;
  storeUrl: string | null;
  /** Optional official store badge; release state does not depend on artwork. */
  badgeSrc: string | null;
};

export const siteConfig = {
  name: "HeyLanguages",
  domain: "https://heylanguages.com",
  productName: "HeyYusuf",
  supportEmail: "dev@heylanguages.com",
  description:
    "Character-led language learning for useful words, confident speaking, and real conversations.",
  legalLastUpdated: "2026-07-16",
  routes: {
    home: "/",
    approach: "/#approach",
    heyyusuf: "/heyyusuf",
    audioDemo: "/heyyusuf#try-arabic",
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
  availability: {
    android: {
      name: "Android",
      state: "available",
      storeUrl: "https://play.google.com/store/apps/details?id=com.heylanguages.heyyusuf",
      badgeSrc: null,
    },
    ios: {
      name: "iPhone",
      state: "coming-soon",
      storeUrl: null,
      badgeSrc: null,
    },
  } satisfies Record<PlatformKey, PlatformAvailability>,
  /** Numeric store-local pricing is omitted unless separately verified. */
  premium: {
    publicPrice: null as string | null,
  },
  social: {
    title: "HeyLanguages | Language Learning for Real Conversations",
    description:
      "Learn with a friendly guide through useful phrases, speaking practice, and everyday conversations.",
    image: "/opengraph-image",
  },
} as const;

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
