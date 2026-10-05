import type { Metadata } from "next";
import { entityIds } from "./entities";
import { blogPosts } from "../content/blog";
import type { BlogPost, InlineContent, PublishedPost } from "./blog-types";
import { createPageMetadata } from "./metadata";
import { absoluteUrl, siteConfig } from "./site";

export const blogUpdated = "2026-10-05";

// Catch broken URLs, duplicated SEO fields, and invalid dates before publishing.
const slugs = new Set<string>();
const titles = new Set<string>();
const descriptions = new Set<string>();
for (const post of blogPosts) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)) {
    throw new Error(`Invalid or duplicate blog slug: ${post.slug}`);
  }
  slugs.add(post.slug);
  if (!post.title.trim() || !post.seoTitle.trim() || !post.description.trim() ||
      titles.has(post.seoTitle) || descriptions.has(post.description)) {
    throw new Error(`Missing or duplicate blog SEO fields: ${post.slug}`);
  }
  titles.add(post.seoTitle);
  descriptions.add(post.description);
  for (const date of [post.dateModified, ...(post.status === "published" ? [post.datePublished] : [])]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date) {
      throw new Error(`Invalid blog date: ${post.slug}`);
    }
  }
  if (post.status === "published" && post.dateModified < post.datePublished) {
    throw new Error(`Blog modification precedes publication: ${post.slug}`);
  }
}

export function getPublishedPosts(): PublishedPost[] {
  return blogPosts
    .filter((post): post is PublishedPost => post.status === "published")
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));
}

export function getDraftPosts() {
  return process.env.NODE_ENV === "development"
    ? blogPosts.filter((post) => post.status === "draft")
    : [];
}

export function getPost(slug: string) {
  return [...getPublishedPosts(), ...getDraftPosts()].find((post) => post.slug === slug);
}

export function postPath(post: BlogPost) {
  return `${siteConfig.routes.blog}/${post.slug}`;
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}

function inlineText(content: InlineContent) {
  return typeof content === "string" ? content : content.map((part) => typeof part === "string" ? part : part.text).join("");
}

export function readingMinutes(post: BlogPost) {
  const text = post.body.map((block) => {
    switch (block.type) {
      case "paragraph": return inlineText(block.content);
      case "heading": return block.text;
      case "callout": return `${block.title} ${inlineText(block.content)}`;
      case "list": return block.items.map(inlineText).join(" ");
      case "arabic": return `${block.text} ${block.transliteration} ${block.translation}`;
      case "table": return [block.caption, ...block.columns, ...block.rows.flat().map(inlineText)].join(" ");
      case "image": return block.caption ?? "";
    }
  }).join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/u).filter(Boolean).length / 200));
}

export function createArticleMetadata(post: BlogPost): Metadata {
  const base = createPageMetadata({
    title: post.seoTitle,
    absoluteTitle: true,
    description: post.description,
    path: postPath(post),
    image: post.image?.src,
  });
  const images = post.image ? [{
    url: absoluteUrl(post.image.src),
    alt: post.image.alt,
    width: post.image.width,
    height: post.image.height,
  }] : undefined;
  return {
    ...base,
    authors: [{ name: post.author.name, url: post.author.url }],
    robots: { index: post.status === "published", follow: post.status === "published" },
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author.url ?? post.author.name],
      section: post.category,
      ...(images ? { images } : {}),
    },
    twitter: { ...base.twitter, ...(images ? { images } : {}) },
  };
}

export function createBlogPosting(post: BlogPost) {
  const url = absoluteUrl(postPath(post));
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: post.author.type === "Organization" && post.author.url === siteConfig.domain
      ? { "@id": entityIds.organization }
      : { "@type": post.author.type, name: post.author.name, ...(post.author.url ? { url: post.author.url } : {}) },
    publisher: { "@id": entityIds.organization },
    // Draft previews have never been published and must not claim a publication date.
    ...(post.status === "published" ? { datePublished: post.datePublished } : {}),
    dateModified: post.dateModified,
    ...(post.image ? { image: absoluteUrl(post.image.src) } : {}),
    articleSection: post.category,
    inLanguage: "en",
  };
}

export function getBlogSitemapEntries() {
  const posts = getPublishedPosts();
  return [
    { url: absoluteUrl(siteConfig.routes.blog), lastModified: [blogUpdated, ...posts.map((post) => post.dateModified)].sort().at(-1)! },
    ...posts.map((post) => ({ url: absoluteUrl(postPath(post)), lastModified: post.dateModified })),
  ];
}
