import type { BlogPost } from "../../lib/blog-types";
import { layoutSample } from "./layout-sample";
import { bestArabicLearningApps } from "./best-arabic-learning-apps";

/** Register each article once; published entries feed routes, cards, and sitemap. */
export const blogPosts: readonly BlogPost[] = [bestArabicLearningApps, layoutSample];
