import { absoluteUrl, siteConfig } from "./site";

export const entityIds = {
  organization: absoluteUrl("/#organization"),
  softwareApplication: absoluteUrl("/heyyusuf#software-application"),
} as const;

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": entityIds.organization,
  name: siteConfig.name,
  url: siteConfig.domain,
};
