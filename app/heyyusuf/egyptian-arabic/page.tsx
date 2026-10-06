import Image from "next/image";
import Link from "next/link";
import { AudioDemo } from "@/components/AudioDemo";
import { ButtonLink } from "@/components/ButtonLink";
import { FAQ } from "@/components/FAQ";
import { entityIds } from "@/lib/entities";
import { createPageMetadata } from "@/lib/metadata";
import { learningPaths, productAssets, productDefinition } from "@/lib/product";
import { absoluteUrl, siteConfig } from "@/lib/site";
import styles from "./page.module.css";

const egyptian = learningPaths.find((path) => path.id === "egyptian")!;
const title = "Learn Egyptian Arabic for Beginners | HeyYusuf";
const description = "Learn Egyptian Arabic with HeyYusuf through practical beginner lessons, pronunciation practice and everyday conversations in a dedicated learning path.";
const url = absoluteUrl(egyptian.futureSlug);
const sampleHref = `#${egyptian.sampleTarget}`;

export const metadata = {
  ...createPageMetadata({ title, description, path: egyptian.futureSlug, absoluteTitle: true, image: "/heyyusuf/opengraph-image" }),
  robots: { index: true, follow: true },
};

const breadcrumbs = [
  { name: "Home", url: siteConfig.domain },
  { name: "HeyYusuf", url: absoluteUrl(siteConfig.routes.heyyusuf) },
  { name: egyptian.label, url },
];
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description,
      inLanguage: "en", dateModified: egyptian.pageLastModified,
      about: { "@id": entityIds.softwareApplication },
      publisher: { "@id": entityIds.organization },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
    },
  ],
};

const comparisons = [
  ["Everyday conversation in Egypt", "A fit for everyday spoken exchanges", "More formal than local everyday speech"],
  ["Formal writing", "Not the main focus of a spoken Egyptian path", "Used widely in formal written communication"],
  ["News and formal media", "Can appear in informal or conversational content", "Common in formal news and media"],
  ["Beginner speaking goal", "Start with conversations in an Egyptian context", "Build a foundation for formal contexts"],
];

const faqs = [
  { question: "Does HeyYusuf teach Egyptian Arabic?", answer: "Yes. HeyYusuf offers a separate Egyptian Arabic learning path for beginners." },
  { question: "Is Egyptian Arabic different from MSA?", answer: "Yes. Egyptian Arabic is associated with everyday spoken communication in Egypt. MSA is used widely in formal writing, education, news and other formal contexts. They are related but serve different purposes." },
  { question: "Can beginners start with Egyptian Arabic?", answer: "Yes. HeyYusuf supports beginners with Arabic text, English meanings, pronunciation guides and audio, so you can begin without already being comfortable reading Arabic." },
  { question: "Is Egyptian Arabic useful if I am travelling to Egypt?", answer: "Yes, if your goal is everyday conversation with Egyptian speakers. Start with language for the situations you expect to encounter, such as greetings, ordering or asking for what you need." },
  { question: "Can I learn Egyptian Arabic and MSA together?", answer: "You can study both. Give each a purpose—Egyptian for everyday conversation and MSA for formal or written contexts—and keep your practice labelled by variety. Choose a workload you can maintain." },
  { question: "Does HeyYusuf teach only Egyptian Arabic?", answer: `No. HeyYusuf also offers ${learningPaths.filter((path) => path.id !== egyptian.id).map((path) => path.label).join(" and ")} as separate learning paths.` },
  { question: "What is the difference between Egyptian Arabic and Gulf Arabic?", answer: "They are different regional spoken varieties: Egyptian Arabic is associated with Egypt, while Gulf Arabic refers to spoken varieties in parts of the Arabian Gulf. Choose around the people and contexts you want to communicate with." },
];

export default function EgyptianArabicPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className={styles.hero}>
        <div className="page-shell">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/heyyusuf">HeyYusuf</Link><span aria-hidden="true">/</span><span aria-current="page">Egyptian Arabic</span>
          </nav>
          <p className="eyebrow">The Egyptian Arabic learning path</p>
          <h1>Learn Egyptian Arabic for <em>Real Conversations</em></h1>
          <p className={styles.lede}>Build practical Egyptian Arabic step by step with beginner lessons, pronunciation practice and everyday conversations.</p>
          <p className={styles.context}>HeyYusuf keeps Egyptian Arabic separate from Modern Standard Arabic (MSA) and Gulf Arabic, so you know which variety you are practising.</p>
          <div className="button-row">
            <ButtonLink href={siteConfig.availability.android.storeUrl}>Learn Egyptian Arabic in HeyYusuf</ButtonLink>
            <a className="button button--secondary" href={sampleHref}>Hear the Egyptian Arabic sample</a>
          </div>
          <p className={styles.availability}>Available on Google Play for Android. iPhone is coming soon.</p>
        </div>
      </header>

      <div className={styles.reading}>
        <section className={styles.section} aria-labelledby="what-is-egyptian">
          <p className="eyebrow eyebrow--dark">The variety matters</p>
          <h2 id="what-is-egyptian">What is Egyptian Arabic?</h2>
          <p>Egyptian Arabic is the everyday spoken variety associated with Egypt. When your goal is to speak with Egyptian friends, family or colleagues, this is a different starting point from learning formal Arabic.</p>
          <p>It is distinct from Modern Standard Arabic (MSA), which is used widely in formal writing, education, news and other formal settings. Knowing which variety a lesson teaches helps you connect what you practise to the conversations you want to have.</p>
        </section>

        <section className={styles.section} aria-labelledby="egyptian-vs-msa">
          <h2 id="egyptian-vs-msa">Egyptian Arabic and MSA serve different purposes.</h2>
          <p>Choose around the situations you want to handle. Egyptian Arabic and MSA are related, but serve different purposes. A conversation during a visit to Egypt and a formal written text call for different language; one variety does not replace the other in every setting.</p>
          <div className={styles.tableWrap} role="region" aria-label="Egyptian Arabic and MSA comparison" tabIndex={0}>
            <table><caption>Egyptian Arabic and MSA in everyday and formal contexts</caption>
              <thead><tr><th scope="col">Your context</th><th scope="col">Egyptian Arabic</th><th scope="col">MSA</th></tr></thead>
              <tbody>{comparisons.map(([context, egyptianUse, msaUse]) => <tr key={context}><th scope="row">{context}</th><td>{egyptianUse}</td><td>{msaUse}</td></tr>)}</tbody>
            </table>
          </div>
          <p className={styles.note}>If you want both spoken and formal Arabic, you can <Link href="/heyyusuf">explore HeyYusuf’s separate learning paths</Link> and give each a clear role in your practice.</p>
        </section>

        <section className={styles.section} aria-labelledby="who-for">
          <h2 id="who-for">Choose Egyptian Arabic around your own conversations.</h2>
          <p>This path is a useful starting point if you are:</p>
          <ul className={styles.list}>
            <li>Planning to visit or spend time in Egypt and wanting to begin everyday exchanges.</li>
            <li>Looking to speak with Egyptian friends, family or colleagues.</li>
            <li>Choosing a spoken Egyptian path rather than a general introduction to formal Arabic.</li>
            <li>Already familiar with some MSA and wanting to add everyday Egyptian speech.</li>
            <li>A beginner whose main interest is conversation in an Egyptian context.</li>
          </ul>
          <p>Start with a situation that matters to you: greeting someone, asking for what you need or talking through a simple choice. That gives the vocabulary and pronunciation you practise a practical purpose.</p>
        </section>
      </div>

      <section className="audio-section" aria-labelledby="egyptian-sample-title">
        <div className="page-shell audio-section__grid">
          <div className="audio-section__intro">
            <p className="eyebrow eyebrow--dark">Hear the actual language</p>
            <h2 id="egyptian-sample-title">A real Egyptian Arabic sample.</h2>
            <p>This existing HeyYusuf website sample brings the Arabic, pronunciation guide and English meaning together. Listen to the Egyptian recording, then try saying the phrase yourself.</p>
            <div className="audio-context"><span>Choosing what to wear</span><p>Yusuf asks: “{egyptian.english}”</p></div>
          </div>
          <AudioDemo pathId="egyptian" />
        </div>
      </section>

      <section className={styles.productEvidence} aria-labelledby="inside-path">
        <div className={`page-shell ${styles.productGrid}`}>
          <div className={styles.section}>
            <p className="eyebrow eyebrow--dark">Inside the Egyptian path</p>
            <h2 id="inside-path">See the language. Hear it. Try saying it.</h2>
            <p>HeyYusuf combines structured beginner learning with practical vocabulary, pronunciation practice and guided conversations in everyday scenarios. Arabic text, English meanings and pronunciation guides help you connect the written phrase with what you hear and say.</p>
            <p>The existing app screenshot shows an Egyptian Arabic lesson labelled “Describing Pain”. It brings the phrase, pronunciation guide and English meaning together with listening and speaking controls.</p>
            <p>The <Link href="/heyyusuf#how-it-works">HeyYusuf overview explains the lesson format</Link> across listening, speaking, recall and review.</p>
          </div>
          <figure className={styles.screenshot}>
            <Image {...productAssets.pronunciation} alt="HeyYusuf Egyptian Arabic lesson titled Describing Pain, showing Arabic text, a pronunciation guide, English meaning, and listening and speaking controls" sizes="(max-width: 760px) 280px, 310px" />
            <figcaption>An existing Egyptian Arabic lesson in HeyYusuf.</figcaption>
          </figure>
        </div>
      </section>

      <div className={styles.reading}>
        <section className={styles.section} aria-labelledby="learning-approach">
          <h2 id="learning-approach">Build a practice routine around useful language.</h2>
          <p>Keep meaning, listening and speaking connected as you work through beginner material.</p>
          <ol className={styles.list}>
            <li><strong>Meet useful language.</strong> Start with a word or phrase connected to a situation you can picture.</li>
            <li><strong>Listen and practise.</strong> Keep the meaning and pronunciation guide nearby while you listen and try speaking.</li>
            <li><strong>Use it in context.</strong> Work with familiar material in guided conversations and practical scenarios.</li>
            <li><strong>Return and continue.</strong> Review what you have met and follow the lesson progression.</li>
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="three-paths">
          <h2 id="three-paths">One app, three Arabic paths.</h2>
          <p>{productDefinition}</p>
          <ul className={styles.paths}>{learningPaths.map((path) => <li key={path.id} className={path.id === egyptian.id ? styles.currentPath : undefined}>{path.pageLastModified && path.id !== egyptian.id ? <Link href={path.futureSlug}>{path.label}</Link> : path.label}{path.id === egyptian.id ? <small>Current path</small> : null}</li>)}</ul>
          <p><Link href="/heyyusuf">Explore the full HeyYusuf experience</Link> to decide which path fits your goals.</p>
        </section>

        <section className={styles.section} aria-labelledby="egyptian-faq">
          <h2 id="egyptian-faq">Questions about learning Egyptian Arabic.</h2>
          <FAQ items={faqs} />
        </section>
        <aside className={styles.related} aria-label="Further reading">
          <p>Still choosing an approach? Read <Link href="/blog/best-arabic-learning-apps">our comparison of Arabic-learning apps</Link>, or explore the <Link href="/blog">HeyLanguages journal</Link>.</p>
        </aside>
      </div>

      <section className={styles.final} aria-labelledby="start-egyptian">
        <div className="page-shell">
          <p className="eyebrow">Your next conversation</p>
          <h2 id="start-egyptian">Ready to start Egyptian Arabic?</h2>
          <p>Learn practical Egyptian Arabic with pronunciation practice, guided lessons and everyday conversations in HeyYusuf.</p>
          <div className="button-row"><ButtonLink href={siteConfig.availability.android.storeUrl}>Start with HeyYusuf</ButtonLink><a className="button button--secondary" href={sampleHref}>Hear the Egyptian sample</a></div>
          <p className={styles.availability}>Android is available now. The iPhone version is coming soon.</p>
        </div>
      </section>
    </main>
  );
}
