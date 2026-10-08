import Image from "next/image";
import Link from "next/link";
import { AudioDemo } from "@/components/AudioDemo";
import { ButtonLink } from "@/components/ButtonLink";
import { entityIds } from "@/lib/entities";
import { featureScreenshots } from "@/lib/features";
import { createPageMetadata } from "@/lib/metadata";
import { learningPaths } from "@/lib/product";
import { absoluteUrl, siteConfig } from "@/lib/site";
import styles from "./page.module.css";

const title = "HeyYusuf Features | Arabic Lessons, Conversations & Pronunciation";
const description = "See inside HeyYusuf: separate MSA, Gulf and Egyptian Arabic paths, guided lessons, conversations, pronunciation practice, alphabet learning and progress features.";
const url = absoluteUrl(siteConfig.routes.features);

export const metadata = createPageMetadata({
  title, description, path: siteConfig.routes.features, absoluteTitle: true,
  image: "/heyyusuf/opengraph-image",
});

const breadcrumbs = [
  { name: "Home", url: siteConfig.domain },
  { name: "HeyYusuf", url: absoluteUrl(siteConfig.routes.heyyusuf) },
  { name: "Features", url },
];
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description,
      inLanguage: "en", dateModified: "2026-10-08",
      about: { "@id": entityIds.softwareApplication },
      publisher: { "@id": entityIds.organization },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem", position: index + 1, name: item.name, item: item.url,
      })),
    },
  ],
};

function Screenshot({ item }: { item: typeof featureScreenshots[keyof typeof featureScreenshots] }) {
  return <figure className={styles.figure}>
    <a href={item.src} aria-label={`View full-size screenshot: ${item.caption}`}>
      <Image src={item.src} width={item.width} height={item.height} alt={item.alt} sizes="(max-width: 459px) calc(100vw - 40px), (max-width: 760px) 420px, (max-width: 1100px) 38vw, 420px" />
    </a>
    <figcaption>{item.caption}</figcaption>
  </figure>;
}

export default function FeaturesPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className={styles.hero}>
        <div className="page-shell">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href={siteConfig.routes.heyyusuf}>HeyYusuf</Link><span aria-hidden="true">/</span><span aria-current="page">Features</span>
          </nav>
          <p className="eyebrow">Lessons, conversations and practice</p>
          <h1>Inside <em>HeyYusuf</em></h1>
          <p className={styles.lede}>A closer look at how HeyYusuf teaches Arabic through separate MSA, Gulf and Egyptian paths, practical lessons, pronunciation practice and guided conversations.</p>
          <p className={styles.provenance}>Screenshots from the current publicly available Google Play version of HeyYusuf.</p>
          <a href="#arabic-paths" className={styles.heroLink}>Explore the learning experience <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <div className={`page-shell ${styles.walkthrough}`}>
        <section id="arabic-paths" className={styles.section} aria-labelledby="paths-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">01 / Your starting point</p>
            <h2 id="paths-title">Choose your Arabic path.</h2>
            <p>HeyYusuf offers three separate Arabic learning paths: Modern Standard Arabic (MSA), Gulf Arabic and Egyptian Arabic. MSA is a standardized variety; Gulf and Egyptian Arabic are regional spoken varieties.</p>
            <ul className={styles.paths}>{learningPaths.map((path) => <li key={path.id}>
              <Link href={path.futureSlug}>{path.label}</Link><p>{path.description}</p>
            </li>)}</ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.visual}`} aria-labelledby="progress-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">02 / Pick up where you left off</p>
            <h2 id="progress-title">Home, progress and continue learning.</h2>
            <p>The home screen brings your selected path, in-app level and XP together. This example shows Gulf Arabic, an Intermediate level label and 2730 XP. Continue Learning returns you to “Understand the Price”, with 29% progress shown for this learner.</p>
            <p>You can also open Start Alphabet for optional practice with Arabic letters. Premium includes downloadable Arabic audio packs for offline listening.</p>
          </div>
          <Screenshot item={featureScreenshots.home} />
        </section>

        <section className={`${styles.section} ${styles.visual}`} aria-labelledby="lessons-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">03 / A little at a time</p>
            <h2 id="lessons-title">Structured units and lessons.</h2>
            <p>Follow a sequence of activities toward a practical conversation. Unit 1, “Your First Arabic Conversation”, introduces greetings and names before activities such as Meet Yusuf and Order a Drink. Lesson, conversation and practice icons distinguish the activity types.</p>
            <p>Each activity has a numbered place in the unit, and checkmarks show completed activities. This screen shows how individual lessons fit into a path toward an introduction and a café conversation.</p>
          </div>
          <Screenshot item={featureScreenshots.path} />
        </section>

        <section className={`${styles.section} ${styles.visual}`} aria-labelledby="speaking-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">04 / Listen, then speak</p>
            <h2 id="speaking-title">Pronunciation and speaking practice.</h2>
            <p>Listen to the phrase, hold the microphone button and say it yourself. Get automated pronunciation feedback on your recording. In the Gulf Arabic Meet Yusuf lesson, the Arabic greeting appears alongside its transliteration and English meaning, “And peace be upon you”. The illustrated scene gives the exchange a setting.</p>
            <p>This example shows a 95% pronunciation result for one recorded attempt.</p>
            <p><Link href="/heyyusuf#app-access">See “What works offline?” for pronunciation access and usage details.</Link></p>
          </div>
          <Screenshot item={featureScreenshots.pronunciation} />
        </section>

        <section id="try-arabic" className={styles.section} aria-labelledby="audio-title">
          <div className={styles.copy}>
            <h2 id="audio-title">Natural-sounding Arabic voices. Hear the difference.</h2>
            <p>Listen to MSA, Gulf and Egyptian Arabic, then practise saying the phrases yourself.</p>
            <p>Listen to “Which shirt do you want?” in each path below. Hear the voice alongside Arabic text, a pronunciation guide and an English meaning.</p>
          </div>
          <div className={styles.audio}><AudioDemo /></div>
        </section>

        <section className={`${styles.section} ${styles.visual}`} aria-labelledby="practice-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">05 / Recall a useful reply</p>
            <h2 id="practice-title">Quizzes, challenges and active recall.</h2>
            <p>“Your First Arabic Conversation Challenge” asks you to choose the missing reply to a greeting. Read the prompt, compare the Arabic answer choices and their transliterations, then select a response. A Show English control offers meaning support.</p>
            <p>The progress indicator shows question 2 of 20 in this captured challenge. Practice also includes number and price activities, such as the “Understand the Price” activity shown on the home screen above.</p>
          </div>
          <Screenshot item={featureScreenshots.challenge} />
        </section>

        <section className={`${styles.section} ${styles.visual}`} aria-labelledby="alphabet-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">06 / Get to know the script</p>
            <h2 id="alphabet-title">Arabic alphabet and reading path.</h2>
            <p>The dedicated alphabet screen invites you to “Make sense of the script”. Choose Read your first word to begin the Build &amp; Read introduction: meet baa and alif, hear the vowels and see how letters connect to form <span lang="ar" dir="rtl">بَاب</span> — baab, meaning “door”.</p>
            <p>Alphabet practice is available as an optional entry point from the home screen.</p>
          </div>
          <Screenshot item={featureScreenshots.alphabet} />
        </section>

        <section className={`${styles.section} ${styles.visual}`} aria-labelledby="vowels-title">
          <div className={styles.copy}>
            <p className="eyebrow eyebrow--dark">07 / Connect a mark with a sound</p>
            <h2 id="vowels-title">Letters, vowel marks and sound.</h2>
            <p>At step 3 of this Build &amp; Read introduction, explore one letter with three short vowel marks: ba, bi and bu. Tap a form to compare how the mark changes the sound while the letter stays the same, and use Listen to hear the selected form.</p>
            <p>The screen highlights the selected form, shows its short vowel sound and tracks how many of the three marks you have explored. Previous and Continue controls place this exploration within the step-by-step reading sequence.</p>
          </div>
          <Screenshot item={featureScreenshots.vowels} />
        </section>
        <aside className={styles.related} aria-label="More about learning Arabic">
          <p>Choosing where to begin? Read our <Link href="/blog/best-arabic-learning-apps">Arabic-learning app guide</Link> or explore more on the <Link href={siteConfig.routes.blog}>HeyLanguages blog</Link>.</p>
        </aside>
      </div>
      <section className={styles.final} aria-labelledby="next-title">
        <div className="page-shell">
          <h2 id="next-title">Find your first conversation.</h2>
          <p>Explore HeyYusuf and choose the Arabic path that fits your goals.</p>
          <ButtonLink href={siteConfig.routes.heyyusuf}>Explore HeyYusuf</ButtonLink>
        </div>
      </section>
    </main>
  );
}
