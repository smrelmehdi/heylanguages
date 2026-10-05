import { ArticleCard } from "@/components/blog/ArticleCard";
import { ButtonLink } from "@/components/ButtonLink";
import { getDraftPosts, getPublishedPosts } from "@/lib/blog";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import styles from "@/components/blog/blog.module.css";

export const metadata = createPageMetadata({
  title: "Arabic Learning Blog | HeyLanguages",
  absoluteTitle: true,
  description: "The HeyLanguages journal for learning Arabic: practical language guides, pronunciation, and everyday conversations with HeyYusuf.",
  path: siteConfig.routes.blog,
});

export default function BlogPage() {
  const posts = getPublishedPosts();
  const drafts = getDraftPosts();
  return (
    <main id="main-content" className={styles.blog}>
      <header className={styles.indexHero}>
        <div className="page-shell">
          <p className="eyebrow eyebrow--dark">The HeyLanguages journal</p>
          <h1>A little clarity.<br />A better <em>conversation.</em></h1>
          <p className={styles.intro}>A space for useful Arabic, thoughtful practice, and the everyday moments that bring a language to life.</p>
        </div>
      </header>
      <div className={`page-shell ${styles.indexContent}`}>
        {posts.length ? (
          <section aria-label="Published articles" className={styles.cardGrid}>
            {posts.map((post) => <ArticleCard key={post.slug} post={post} />)}
          </section>
        ) : (
          <section className={styles.empty} aria-labelledby="first-guide-title">
            <p className="eyebrow eyebrow--dark">From the journal</p>
            <h2 id="first-guide-title">Our first guide is on its way.</h2>
            <p>While we prepare the first article, meet Yusuf and try a little Arabic.</p>
            <ButtonLink href={siteConfig.routes.audioDemo} variant="dark">Try the Arabic sample</ButtonLink>
          </section>
        )}
        {drafts.length ? (
          <section className={styles.draftSection} aria-labelledby="draft-preview-title">
            <p className="eyebrow eyebrow--dark" id="draft-preview-title">Development only · unpublished drafts</p>
            <div className={styles.cardGrid}>{drafts.map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
