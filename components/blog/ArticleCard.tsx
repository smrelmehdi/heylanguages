import Link from "next/link";
import { formatBlogDate, postPath, readingMinutes } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog-types";
import styles from "./blog.module.css";

export function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <article className={styles.card}>
      <p className="eyebrow eyebrow--dark">{post.category}</p>
      <h2><Link href={postPath(post)}>{post.title}</Link></h2>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <div className={styles.meta}>
        {post.status === "published"
          ? <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished)}</time>
          : <span>Draft · not published</span>}
        <span>{readingMinutes(post)} min read</span>
      </div>
      <Link className={styles.readLink} href={postPath(post)} aria-label={`Read ${post.title}`}>
        Read {post.status === "draft" ? "draft" : "article"} <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
