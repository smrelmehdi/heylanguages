import Link from "next/link";
import { AudioDemo } from "@/components/AudioDemo";
import { ButtonLink } from "@/components/ButtonLink";
import { FAQ } from "@/components/FAQ";
import { entityIds } from "@/lib/entities";
import { createPageMetadata } from "@/lib/metadata";
import { learningPaths, productDefinition } from "@/lib/product";
import { absoluteUrl, siteConfig } from "@/lib/site";
import styles from "./page.module.css";

const gulf = learningPaths.find((path) => path.id === "gulf")!;
const title = "Learn Gulf Arabic for Beginners | HeyYusuf";
const description = "Learn Gulf Arabic with HeyYusuf through practical beginner lessons, pronunciation practice and real-life conversations, with a UAE-oriented learning path.";
const url = absoluteUrl(gulf.futureSlug);
const sampleHref = `#${gulf.sampleTarget}`;

export const metadata = {
  ...createPageMetadata({ title, description, path: gulf.futureSlug, absoluteTitle: true, image: "/heyyusuf/opengraph-image" }),
  robots: { index: true, follow: true },
};

const breadcrumbs = [
  { name: "Home", url: siteConfig.domain },
  { name: "HeyYusuf", url: absoluteUrl(siteConfig.routes.heyyusuf) },
  { name: gulf.label, url },
];
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description,
      inLanguage: "en", dateModified: gulf.pageLastModified,
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
  ["Everyday Gulf conversation", "Focuses on spoken language in Gulf contexts", "A formal variety, distinct from local everyday speech"],
  ["Formal writing", "Not the main focus of a spoken Gulf path", "Used widely in formal written communication"],
  ["News and formal media", "Regional speech can appear, depending on the setting", "Common in formal news and media"],
  ["Life in the UAE", "Relevant when your goal is conversation with Emirati speakers", "Useful for written and formal contexts"],
];

const faqs = [
  { question: "Does HeyYusuf teach Gulf Arabic?", answer: "Yes. HeyYusuf has a dedicated Gulf Arabic learning path with beginner lessons, pronunciation practice and guided conversations." },
  { question: "Is Gulf Arabic the same as Emirati Arabic?", answer: "Emirati Arabic is a local variety within the broader Gulf Arabic context. HeyYusuf’s Gulf path focuses on everyday speech in the UAE, with an emphasis on Emirati Arabic." },
  { question: "Is Gulf Arabic different from MSA?", answer: "Yes. Gulf Arabic refers to regional spoken varieties, while Modern Standard Arabic is used widely in formal writing, news and structured settings. They serve different purposes." },
  { question: "Is this useful if I live in Dubai or the UAE?", answer: "The Gulf path is relevant if your goal is to begin using Arabic in everyday exchanges with Emirati speakers. In Dubai or elsewhere in the UAE, choose your path around the people you want to speak with." },
  { question: "Can beginners start with Gulf Arabic?", answer: "Yes. HeyYusuf supports beginners with Arabic text, English meanings, pronunciation guides and audio. You do not need to be comfortable reading Arabic before starting." },
  { question: "Can I learn Gulf Arabic and MSA together?", answer: "You can choose to study both. Give each a clear purpose—for example, Gulf for everyday exchanges and MSA for formal or written contexts. Keep your practice labelled by variety and choose a workload you can maintain." },
  { question: "Does HeyYusuf teach only Gulf Arabic?", answer: `No. HeyYusuf also offers ${learningPaths.filter((path) => path.id !== gulf.id).map((path) => path.label).join(" and ")} as separate paths.` },
];

export default function GulfArabicPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className={styles.hero}>
        <div className="page-shell">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/heyyusuf">HeyYusuf</Link><span aria-hidden="true">/</span><span aria-current="page">Gulf Arabic</span>
          </nav>
          <p className="eyebrow">The Gulf Arabic learning path</p>
          <h1>Learn Gulf Arabic for <em>real life.</em></h1>
          <p className={styles.lede}>Build practical Gulf Arabic step by step with beginner lessons, pronunciation practice and everyday conversations.</p>
          <p className={styles.context}>HeyYusuf keeps Gulf Arabic separate from Modern Standard Arabic (MSA) and Egyptian Arabic, so you know which variety you are practising.</p>
          <div className="button-row">
            <ButtonLink href={siteConfig.availability.android.storeUrl}>Learn Gulf Arabic in HeyYusuf</ButtonLink>
            <a className="button button--secondary" href={sampleHref}>Hear the Gulf Arabic sample</a>
          </div>
          <p className={styles.availability}>Available on Google Play for Android. iPhone is coming soon.</p>
        </div>
      </header>

      <div className={styles.reading}>
        <section className={styles.section} aria-labelledby="what-is-gulf">
          <p className="eyebrow eyebrow--dark">The variety matters</p>
          <h2 id="what-is-gulf">What is Gulf Arabic?</h2>
          <p>Gulf Arabic, also called Khaleeji Arabic, refers broadly to spoken varieties used across parts of the Arabian Gulf. Local speech varies by country and community; there is no single identical dialect used everywhere in the Gulf.</p>
          <p>HeyYusuf’s current Gulf path focuses on <strong>everyday speech in the UAE, with an emphasis on Emirati Arabic</strong>.</p>
        </section>

        <section className={styles.section} aria-labelledby="gulf-vs-msa">
          <h2 id="gulf-vs-msa">Gulf Arabic and MSA serve different purposes.</h2>
          <p>Choose around the situations you want to handle. Everyday conversation with Gulf Arabic speakers and reading formal Arabic are different goals.</p>
          <div className={styles.tableWrap} role="region" aria-label="Gulf Arabic and MSA comparison" tabIndex={0}>
            <table><caption>Gulf Arabic and MSA in everyday and formal contexts</caption>
              <thead><tr><th scope="col">Your context</th><th scope="col">Gulf Arabic</th><th scope="col">MSA</th></tr></thead>
              <tbody>{comparisons.map(([context, gulfUse, msaUse]) => <tr key={context}><th scope="row">{context}</th><td>{gulfUse}</td><td>{msaUse}</td></tr>)}</tbody>
            </table>
          </div>
          <p className={styles.note}>For background, <a href="https://alramsa.ae/alramsa-faqs/">Al Ramsa Institute explains the difference between MSA and Emirati Arabic</a>. You can also <Link href="/heyyusuf">compare HeyYusuf’s three learning paths</Link>.</p>
        </section>

        <section className={styles.section} aria-labelledby="who-for">
          <h2 id="who-for">Start with the people you want to speak to.</h2>
          <p>The Gulf path is worth considering if you are:</p>
          <ul className={styles.list}>
            <li>A UAE resident or expat interested in everyday exchanges with Emirati speakers.</li>
            <li>Working with Gulf Arabic speakers and looking for a beginner starting point for informal conversation.</li>
            <li>Building family or social connections in the Gulf.</li>
            <li>Travelling in the region and wanting to begin with useful spoken language.</li>
            <li>Already familiar with some MSA and looking to explore a regional spoken variety.</li>
          </ul>
          <p>For life in Dubai or elsewhere in the UAE, let your intended conversations guide your choice. The focus here is beginner practice for everyday exchanges.</p>
        </section>
      </div>

      <section className="audio-section" aria-labelledby="gulf-sample-title">
        <div className="page-shell audio-section__grid">
          <div className="audio-section__intro">
            <p className="eyebrow eyebrow--dark">Hear the actual language</p>
            <h2 id="gulf-sample-title">A real Gulf Arabic sample.</h2>
            <p>This HeyYusuf sample brings the Arabic, pronunciation guide and English meaning together. Listen to the Gulf recording, then try saying the phrase yourself.</p>
            <div className="audio-context"><span>Choosing what to wear</span><p>Yusuf asks: “{gulf.english}”</p></div>
          </div>
          <AudioDemo pathId="gulf" />
        </div>
      </section>

      <div className={styles.reading}>
        <section className={styles.section} aria-labelledby="inside-path">
          <p className="eyebrow eyebrow--dark">Inside HeyYusuf</p>
          <h2 id="inside-path">Useful language, supported practice.</h2>
          <p>The Gulf path uses HeyYusuf’s structured beginner approach: practical vocabulary, pronunciation practice and guided conversations in everyday scenarios. Arabic text sits alongside English meanings and pronunciation support, so reading the script does not have to be your first hurdle.</p>
          <p>The sample above shows the language and audio you can try here. The <Link href="/heyyusuf#how-it-works">product overview explains the wider lesson format</Link>, including listening, speaking, recall, review and progression.</p>
          <h3>A manageable way to begin</h3>
          <ol className={styles.list}>
            <li><strong>Meet useful language.</strong> Start with a word or phrase connected to a situation you can picture.</li>
            <li><strong>Listen and practise.</strong> Keep the meaning and pronunciation guide nearby while you listen and try speaking.</li>
            <li><strong>Use it in context.</strong> Work with familiar material in guided conversations and practical scenarios.</li>
            <li><strong>Return and continue.</strong> Review what you have met and follow the lesson progression.</li>
          </ol>
          <p>Keep the language, its meaning and its use connected as you practise.</p>
        </section>

        <section className={styles.section} aria-labelledby="three-paths">
          <h2 id="three-paths">One app, three Arabic paths.</h2>
          <p>{productDefinition}</p>
          <ul className={styles.paths}>{learningPaths.map((path) => <li key={path.id} className={path.id === gulf.id ? styles.currentPath : undefined}>{path.pageLastModified && path.id !== gulf.id ? <Link href={path.futureSlug}>{path.label}</Link> : path.label}{path.id === gulf.id ? <small>Current path</small> : null}</li>)}</ul>
          <p><Link href="/heyyusuf">Explore the full HeyYusuf experience</Link> to decide which path fits your goals.</p>
        </section>

        <section className={styles.section} aria-labelledby="gulf-faq">
          <h2 id="gulf-faq">Questions about learning Gulf Arabic.</h2>
          <FAQ items={faqs} />
        </section>
        <aside className={styles.related} aria-label="Further reading">
          <p>Still choosing an approach? Read <Link href="/blog/best-arabic-learning-apps">our comparison of Arabic-learning apps</Link>, or explore the <Link href="/blog">HeyLanguages journal</Link>.</p>
        </aside>
      </div>

      <section className={styles.final} aria-labelledby="start-gulf">
        <div className="page-shell">
          <p className="eyebrow">Your next conversation</p>
          <h2 id="start-gulf">Ready to start Gulf Arabic?</h2>
          <p>Learn practical Gulf Arabic with pronunciation practice, guided lessons and everyday conversations in HeyYusuf.</p>
          <div className="button-row"><ButtonLink href={siteConfig.availability.android.storeUrl}>Start with HeyYusuf</ButtonLink><a className="button button--secondary" href={sampleHref}>Hear the Gulf sample</a></div>
          <p className={styles.availability}>Android is available now. The iPhone version is coming soon.</p>
        </div>
      </section>
    </main>
  );
}
