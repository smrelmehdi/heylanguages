import type { BlogPost } from "../../lib/blog-types";

/** Development-only typography fixture. This is not Article #1. */
export const layoutSample = {
  slug: "layout-sample",
  status: "draft",
  title: "Draft: article layout sample",
  seoTitle: "Draft article layout sample | HeyLanguages",
  description: "A development-only sample for checking the HeyLanguages article layout.",
  excerpt: "A layout check for Arabic, transliteration, tables, callouts, links, lists, and images. Not a published guide.",
  category: "Layout sample",
  author: { type: "Organization", name: "HeyLanguages", url: "https://heylanguages.com" },
  dateModified: "2026-10-05",
  image: { src: "/scenes/cafe-conversation.webp", alt: "Illustration of Yusuf at a café counter", width: 768, height: 1344 },
  body: [
    { type: "paragraph", content: "This draft checks the article template. It is not a published Arabic-learning guide." },
    { type: "heading", level: 2, id: "language-example", text: "Arabic and transliteration" },
    { type: "paragraph", content: ["An inline Arabic word such as ", { type: "arabic", text: "مرحباً" }, " can sit alongside English. Longer examples have their own space below."] },
    { type: "arabic", text: "مرحباً", transliteration: "marhaban", translation: "Hello" },
    { type: "heading", level: 3, id: "reading-details", text: "Details within a section" },
    { type: "paragraph", content: ["This paragraph checks ", { type: "strong", text: "emphasis" }, ", ", { type: "emphasis", text: "italic text" }, ", and a contextual link to the ", { type: "link", text: "HeyYusuf audio sample", href: "/heyyusuf#try-arabic" }, "."] },
    { type: "callout", title: "Layout note", content: "A short supporting note stays close to the passage it explains." },
    { type: "heading", level: 2, id: "table-example", text: "A readable table" },
    { type: "table", caption: "Sample formatting only", columns: ["Arabic", "Transliteration", "Meaning"], rows: [[[{ type: "arabic", text: "مرحباً" }], "marhaban", "Hello"]] },
    { type: "heading", level: 2, id: "list-example", text: "Lists and images" },
    { type: "list", items: ["A short supporting point.", "A second point with room to breathe."] },
    { type: "list", ordered: true, items: ["Read the example.", "Return to the section above."] },
    { type: "image", image: { src: "/scenes/cafe-conversation.webp", alt: "Yusuf speaking with a barista at a café counter", width: 768, height: 1344 }, caption: "Existing HeyYusuf artwork, used here to check image presentation." },
  ],
} satisfies BlogPost;
