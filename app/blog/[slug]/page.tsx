import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ButtonLink } from "@/components/ButtonLink";
import { createArticleMetadata, createBlogPosting, formatBlogDate, getPost, getPublishedPosts, readingMinutes } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import styles from "@/components/blog/blog.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return createArticleMetadata(post);
}

export default async function ArticlePage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <main id="main-content" className={styles.blog}>
      <article className={styles.article}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBlogPosting(post)).replace(/</g, "\\u003c"),
        }} />
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={siteConfig.routes.blog}>Journal</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{post.category}</span>
        </nav>
        {post.status === "draft" ? (
          <aside className={styles.draftNotice}>Unpublished draft · development preview only. This sample is not available in production.</aside>
        ) : null}
        <header className={styles.articleHeader}>
          <p className="eyebrow eyebrow--dark">{post.category}</p>
          <h1>{post.title}</h1>
          <p className={styles.intro}>{post.excerpt}</p>
          <div className={styles.meta}>
            <span>By {post.author.url ? <a href={post.author.url} rel="author">{post.author.name}</a> : post.author.name}</span>
            {post.status === "published" ? <span>Published <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished)}</time></span> : null}
            <span>{readingMinutes(post)} min read</span>
          </div>
          {post.dateModified !== post.datePublished ? <p className={styles.updated}>Updated <time dateTime={post.dateModified}>{formatBlogDate(post.dateModified)}</time></p> : null}
        </header>
        <ArticleBody blocks={post.body} />
        <aside className={styles.productNote} aria-labelledby="practice-title">
          <p className="eyebrow eyebrow--dark">Keep practicing</p>
          <h2 id="practice-title">{post.productCta?.headline ?? "Bring a little Arabic into your day."}</h2>
          <p>{post.productCta?.description ?? "Explore guided lessons and pronunciation practice with HeyYusuf, or listen to a short sample in MSA, Egyptian, and Gulf Arabic."}</p>
          <div className="button-row">
            <ButtonLink href={siteConfig.routes.heyyusuf} variant="dark">Explore HeyYusuf</ButtonLink>
            <Link href={siteConfig.routes.audioDemo}>Listen to a sample <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>
        <Link className={styles.backLink} href={siteConfig.routes.blog}>← Back to the journal</Link>
      </article>
    </main>
  );
}
