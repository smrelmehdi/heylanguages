import type { MetadataRoute } from "next";
import { absoluteUrl, publicRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date("2026-07-16"),
    changeFrequency: route === "/" ? "monthly" : "yearly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
