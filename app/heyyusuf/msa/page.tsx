import Link from "next/link";
import { AudioDemo } from "@/components/AudioDemo";
import { ButtonLink } from "@/components/ButtonLink";
import { FAQ } from "@/components/FAQ";
import { entityIds } from "@/lib/entities";
import { createPageMetadata } from "@/lib/metadata";
import { learningPaths, productDefinition } from "@/lib/product";
import { absoluteUrl, siteConfig } from "@/lib/site";
import styles from "./page.module.css";

const msa = learningPaths.find((path) => path.id === "msa")!;
const title = "Learn Modern Standard Arabic (MSA) | HeyYusuf";
const description = "Learn Modern Standard Arabic with HeyYusuf through structured beginner lessons, pronunciation practice and practical conversations in a separate MSA learning path.";
const url = absoluteUrl(msa.futureSlug);
const sampleHref = `#${msa.sampleTarget}`;

export const metadata = {
  ...createPageMetadata({ title, description, path: msa.futureSlug, absoluteTitle: true, image: "/heyyusuf/opengraph-image" }),
  robots: { index: true, follow: true },
};

const breadcrumbs = [
  { name: "Home", url: siteConfig.domain },
  { name: "HeyYusuf", url: absoluteUrl(siteConfig.routes.heyyusuf) },
  { name: "Modern Standard Arabic", url },
];
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description,
      inLanguage: "en", dateModified: msa.pageLastModified,
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
  ["Formal writing", "Used widely in formal written communication", "A more limited role in formal writing"],
  ["News and formal media", "Common in formal news and media", "Can appear in informal or conversational content"],
  ["Everyday local conversation", "More formal than regional everyday speech", "Usually more natural for local exchanges"],
  ["Reading across regions", "A shared standard for formal written Arabic", "Written usage is more tied to a region or community"],
  ["Your starting goal", "A foundation for formal and written Arabic", "A foundation for speaking with a particular community"],
];

const faqs = [
  { question: "Does HeyYusuf teach Modern Standard Arabic?", answer: "Yes. HeyYusuf offers Modern Standard Arabic (MSA) as a separate beginner learning path." },
  { question: "Is MSA the same as spoken Arabic?", answer: "MSA can be spoken, particularly in formal settings, but it is not the same as everyday regional dialects. Gulf and Egyptian Arabic are separate spoken varieties with different uses." },
  { question: "Should beginners start with MSA?", answer: "MSA is a useful starting point if your goals include reading and formal Arabic. If your priority is everyday conversation with a specific community, consider its spoken variety. You do not have to learn MSA before choosing a dialect." },
  { question: "Is MSA useful if I live in the UAE?", answer: "MSA is useful for formal and written Arabic. Gulf Arabic is more relevant for local everyday speech with Emirati speakers. Choose around the situations and people you want to communicate with." },
  { question: "Can I learn MSA and Gulf Arabic together?", answer: "Yes. Give each a clear purpose: MSA for formal or written contexts, and Gulf for everyday exchanges with Gulf Arabic speakers. Keep your practice labelled by variety and choose a manageable workload." },
  { question: "Can I learn MSA and Egyptian Arabic together?", answer: "Yes. You can pair MSA reading and formal-language goals with spoken Egyptian practice. HeyYusuf keeps the two paths separate so you know which variety you are studying." },
  { question: "Does HeyYusuf teach only MSA?", answer: `No. HeyYusuf also offers ${learningPaths.filter((path) => path.id !== msa.id).map((path) => path.label).join(" and ")} as separate learning paths.` },
];

export default function MSAPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className={styles.hero}>
        <div className="page-shell">
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/heyyusuf">HeyYusuf</Link><span aria-hidden="true">/</span><span aria-current="page">Modern Standard Arabic</span>
          </nav>
          <p className="eyebrow">The MSA learning path</p>
          <h1>Learn Modern Standard Arabic with a <em>Clear Beginner Path</em></h1>
          <p className={styles.lede}>Build a practical foundation in MSA with beginner lessons, pronunciation practice, reading support and guided conversations.</p>
          <p className={styles.context}>HeyYusuf keeps MSA separate from Gulf and Egyptian Arabic, so you know which variety you are practising.</p>
          <div className="button-row">
            <ButtonLink href={siteConfig.availability.android.storeUrl}>Learn MSA in HeyYusuf</ButtonLink>
            <a className="button button--secondary" href={sampleHref}>Hear the MSA sample</a>
          </div>
          <p className={styles.availability}>Available on Google Play for Android. iPhone is coming soon.</p>
        </div>
      </header>

      <div className={styles.reading}>
        <section className={styles.section} aria-labelledby="what-is-msa">
          <p className="eyebrow eyebrow--dark">A shared standard across regions</p>
          <h2 id="what-is-msa">What is Modern Standard Arabic?</h2>
          <p>Modern Standard Arabic, usually shortened to MSA, is the standardized form of Arabic used across the Arabic-speaking world. It is widely used in writing, education, news, official communication, speeches and other formal or public contexts.</p>
          <p>MSA is also spoken in formal settings. It is distinct from the regional dialects people use in everyday local conversation. Learning MSA gives reading and formal communication a clear place in your Arabic studies; it does not replace every spoken variety.</p>
          <p className={styles.note}><a href="https://dictionary.cambridge.org/dictionary/english/modern-standard-arabic">Cambridge Dictionary describes MSA</a> as consistent across the Arab world and used in print, speeches, lectures and news.</p>
          <div className={styles.goalNote}>
            <h3>Start with what you want to do.</h3>
            <p>If you want to read formal Arabic across countries, MSA is a relevant starting point. If your immediate goal is conversation with Egyptian or Gulf Arabic speakers, a spoken path may be more useful first. You can also study both, with a purpose for each.</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="msa-vs-dialects">
          <h2 id="msa-vs-dialects">MSA and spoken dialects: different roles, shared value.</h2>
          <p>The choice is about the Arabic you expect to read, hear and use. Formal writing and a relaxed local conversation are different contexts, so neither MSA nor a dialect is the right answer for every goal.</p>
          <div className={styles.tableWrap} role="region" aria-label="MSA and spoken dialects comparison" tabIndex={0}>
            <table><caption>Choosing Arabic around your context</caption>
              <thead><tr><th scope="col">Your context</th><th scope="col">MSA</th><th scope="col">Spoken dialect</th></tr></thead>
              <tbody>{comparisons.map(([context, msaUse, dialectUse]) => <tr key={context}><th scope="row">{context}</th><td>{msaUse}</td><td>{dialectUse}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Many learners have reasons to study both. For example, you might choose MSA for reading and <Link href="/heyyusuf/gulf-arabic">Gulf Arabic</Link> or <Link href="/heyyusuf/egyptian-arabic">Egyptian Arabic</Link> for conversations with those speakers. Keep the varieties distinct as you practise.</p>
        </section>

        <section className={styles.section} aria-labelledby="who-for">
          <h2 id="who-for">Who should consider the MSA path?</h2>
          <ul className={styles.list}>
            <li>Beginners who want a foundation in formal Arabic.</li>
            <li>Learners who care about reading Arabic and connecting written words with their sound and meaning.</li>
            <li>Students interested in the formal Arabic used across countries.</li>
            <li>People who want MSA alongside a spoken dialect, with a clear role for each.</li>
            <li>Learners who have not yet chosen a regional dialect and want to begin with the formal variety.</li>
          </ul>
          <p>You can start with one path and reconsider your priorities as your goals become clearer. MSA is a choice of focus, not a prerequisite for learning Gulf or Egyptian Arabic.</p>
        </section>
      </div>

      <section className="audio-section" aria-labelledby="msa-sample-title">
        <div className="page-shell audio-section__grid">
          <div className="audio-section__intro">
            <p className="eyebrow eyebrow--dark">Connect script, meaning and sound</p>
            <h2 id="msa-sample-title">Hear a real MSA example.</h2>
            <p>Read the Arabic alongside its English meaning, then listen to the recording. The pronunciation guide gives you another way into the phrase while you become familiar with the script.</p>
            <div className="audio-context"><span>Choosing what to wear</span><p>Yusuf asks: “{msa.english}”</p></div>
          </div>
          <AudioDemo pathId="msa" />
        </div>
      </section>

      <div className={styles.reading}>
        <section className={styles.section} aria-labelledby="inside-path">
          <p className="eyebrow eyebrow--dark">Inside the MSA path</p>
          <h2 id="inside-path">Practise the language as well as recognising it.</h2>
          <p>HeyYusuf’s structured beginner learning pairs Arabic script with English meanings, pronunciation guides and audio. Listening and pronunciation practice help connect what you see with what you hear and say.</p>
          <p>Guided conversations let you work with familiar language in context. Review and progression help organise what you practise next. The <Link href="/heyyusuf#how-it-works">HeyYusuf overview explains the lesson format</Link>.</p>
          <h3>A way to begin with MSA</h3>
          <ol className={styles.list}>
            <li><strong>Meet useful beginner language.</strong> Start with a word or phrase and a clear meaning.</li>
            <li><strong>Connect the script with the sound.</strong> Look at the Arabic, use the pronunciation guide and listen to the recording.</li>
            <li><strong>Try saying it.</strong> Practise the pronunciation while keeping the English meaning in view.</li>
            <li><strong>Use familiar language.</strong> Bring what you have met into guided practice rather than treating every phrase in isolation.</li>
            <li><strong>Review and continue.</strong> Return to earlier material and follow the lesson progression.</li>
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="three-paths">
          <h2 id="three-paths">One app, three Arabic paths.</h2>
          <p>{productDefinition}</p>
          <ul className={styles.paths}>{learningPaths.map((path) => <li key={path.id} className={path.id === msa.id ? styles.currentPath : undefined}>{path.pageLastModified && path.id !== msa.id ? <Link href={path.futureSlug}>{path.label}</Link> : path.label}{path.id === msa.id ? <small>Current path</small> : null}</li>)}</ul>
          <p><Link href="/heyyusuf">Explore HeyYusuf’s three learning paths</Link> and choose around your reading, listening and speaking goals.</p>
        </section>

        <section className={styles.section} aria-labelledby="msa-faq">
          <h2 id="msa-faq">Questions about learning MSA.</h2>
          <FAQ items={faqs} />
        </section>
        <aside className={styles.related} aria-label="Further reading">
          <p>Comparing your options? Read <Link href="/blog/best-arabic-learning-apps">our comparison of Arabic-learning apps</Link>, or explore the <Link href="/blog">HeyLanguages journal</Link>.</p>
        </aside>
      </div>

      <section className={styles.final} aria-labelledby="start-msa">
        <div className="page-shell">
          <p className="eyebrow">Your Arabic foundation</p>
          <h2 id="start-msa">Start learning MSA with HeyYusuf.</h2>
          <p>Bring Arabic text, meaning and sound together through beginner lessons, pronunciation practice and guided conversations.</p>
          <div className="button-row"><ButtonLink href={siteConfig.availability.android.storeUrl}>Learn MSA in HeyYusuf</ButtonLink><a className="button button--secondary" href={sampleHref}>Hear the MSA sample</a></div>
          <p className={styles.availability}>Android is available now. The iPhone version is coming soon.</p>
        </div>
      </section>
    </main>
  );
}
