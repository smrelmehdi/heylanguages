import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "./site";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  image?: string;
  absoluteTitle?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = siteConfig.social.image,
  absoluteTitle = false,
}: PageMetadata): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
