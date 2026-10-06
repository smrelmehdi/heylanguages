import type { MetadataRoute } from "next";
import { learningPaths } from "@/lib/product";
import { getBlogSitemapEntries } from "@/lib/blog";
import { absoluteUrl, publicRoutes, siteConfig } from "@/lib/site";

const marketingRoutes = new Set<string>([
  siteConfig.routes.home,
  siteConfig.routes.heyyusuf,
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    // Both marketing pages render the corrected HeyYusuf availability component.
    lastModified: new Date(marketingRoutes.has(route) ? "2026-10-05" : siteConfig.legalLastUpdated),
    changeFrequency: marketingRoutes.has(route) ? "monthly" : "yearly",
    priority: route === "/" ? 1 : route === siteConfig.routes.heyyusuf ? 0.95 : 0.7,
  }));
  return [...pages, ...learningPaths.filter((path) => path.pageLastModified).map((path) => ({
    url: absoluteUrl(path.futureSlug),
    lastModified: path.pageLastModified!,
  })), ...getBlogSitemapEntries()];
}
