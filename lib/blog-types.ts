export type InlineContent = string | readonly (
  | string
  | { type: "link"; text: string; href: string }
  | { type: "strong" | "emphasis" | "arabic"; text: string }
)[];

export type ArticleImage = {
  /** Local public asset path. Add remote image hosts to next.config.ts if needed. */
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ArticleBlock =
  | { type: "paragraph"; content: InlineContent }
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "list"; ordered?: boolean; items: readonly InlineContent[] }
  | { type: "arabic"; text: string; transliteration: string; translation: string }
  | { type: "table"; caption: string; columns: readonly string[]; rows: readonly (readonly InlineContent[])[] }
  | { type: "callout"; title: string; content: InlineContent }
  | { type: "image"; image: ArticleImage; caption?: string };

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  category: string;
  author: { type: "Person" | "Organization"; name: string; url?: string };
  dateModified: string;
  image?: ArticleImage;
  productCta?: { headline: string; description: string };
  body: readonly ArticleBlock[];
} & (
  | { status: "published"; datePublished: string }
  | { status: "draft"; datePublished?: never }
);

export type PublishedPost = BlogPost & { status: "published" };
