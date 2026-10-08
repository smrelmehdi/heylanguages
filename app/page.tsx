import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { Availability } from "@/components/Availability";
import { createPageMetadata } from "@/lib/metadata";
import { learningPaths, productDefinition, productAssets } from "@/lib/product";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "HeyLanguages | Language Learning for Real Conversations",
  absoluteTitle: true,
  description:
    productDefinition,
  path: siteConfig.routes.home,
});

const approach = [
  {
    number: "01",
    title: "Hear it.",
    body: "Listen to the phrase, see its English meaning, and follow a readable pronunciation guide.",
    evidence: (
      <div className="approach-evidence approach-evidence--hear" aria-label="Audio phrase example">
        <span className="approach-evidence__play" aria-hidden="true">▶</span>
        <span dir="rtl" lang="ar">أهلاً وسهلاً</span>
        <small>ahlan wa sahlan</small>
      </div>
    ),
  },
  {
    number: "02",
    title: "Say it.",
    body: "Practice speaking when you are ready, with the phrase still in view and Yusuf alongside you.",
    evidence: (
      <div className="approach-evidence approach-evidence--say" aria-label="Speaking practice example">
        <span className="approach-evidence__mic" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3M9 21h6" /></svg>
        </span>
        <span>Practice speaking</span>
      </div>
    ),
  },
  {
    number: "03",
    title: "Use it.",
    body: "Bring familiar words into a guided exchange, so recall starts to feel like conversation.",
    evidence: (
      <div className="approach-evidence approach-evidence--use" aria-label="Guided conversation example">
        <span dir="rtl" lang="ar">أي قميص تريد؟</span>
        <span dir="rtl" lang="ar">أريد القميص الأبيض.</span>
      </div>
    ),
  },
];

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="home-hero__halo" aria-hidden="true" />
        <div className="page-shell home-hero__grid">
          <div className="home-hero__copy">
            <p className="eyebrow eyebrow--dark">Meet your next language</p>
            <h1>Real conversations start with a <em>hello.</em></h1>
            <p className="home-hero__lede">
              {productDefinition} Learn with a friendly guide by your side.
            </p>
            <div className="button-row">
              <ButtonLink href={siteConfig.routes.heyyusuf}>Explore HeyYusuf</ButtonLink>
              <ButtonLink href="#approach" variant="dark">See how it works</ButtonLink>
            </div>
            <p className="home-hero__note">
              Arabic first <span aria-hidden="true">•</span> No Arabic reading experience needed to begin
            </p>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__scene">
              <Image
                alt="Yusuf guiding a learner through a café conversation"
                fill
                priority
                sizes="(max-width: 767px) 88vw, (max-width: 1199px) 48vw, 560px"
                src={productAssets.scenes.cafe.src}
              />
            </div>
            <div className="phrase-note phrase-note--hero">
              <span>First phrase</span>
              <strong dir="rtl" lang="ar">مرحباً</strong>
              <p>marhaban</p>
              <small>Hello</small>
            </div>
            <div className="guide-chip">
              <Image
                alt=""
                aria-hidden="true"
                height={96}
                src={productAssets.yusuf.src}
                width={96}
              />
              <span><strong>Learn with Yusuf</strong>Friendly guidance, one step at a time.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flagship-section" aria-labelledby="flagship-title">
        <div className="page-shell flagship-grid">
          <div className="flagship-preview">
            <div className="phone-frame phone-frame--home">
              <div className="phone-frame__bar" aria-hidden="true" />
              <Image
                alt="HeyYusuf Egyptian Arabic pronunciation lesson showing a phrase, pronunciation guide, and listening and speaking controls"
                height={productAssets.pronunciation.height}
                sizes="(max-width: 767px) 72vw, 360px"
                src={productAssets.pronunciation.src}
                width={productAssets.pronunciation.width}
              />
            </div>
            <div className="flagship-preview__caption">
              <span aria-hidden="true">↗</span>
              Real app preview: pronunciation practice
            </div>
          </div>

          <div className="flagship-copy">
            <div className="product-lockup">
              <Image
                alt="HeyYusuf logo"
                height={64}
                src={productAssets.logo.src}
                width={64}
              />
              <span>HeyYusuf</span>
            </div>
            <p className="eyebrow">Our first companion</p>
            <h2 id="flagship-title">Arabic that starts where you are.</h2>
            <p>
              Meet useful phrases, hear how they sound, practice speaking, then
              use familiar material in guided conversations. Yusuf keeps the
              path clear without making your first lesson feel like a textbook.
              Choose from three separate learning paths.
            </p>
            <div className="dialect-line" aria-label="Arabic varieties available">
              {learningPaths.map((path) => <span key={path.id}>{path.pageLastModified ? <Link href={path.futureSlug}>{path.label}</Link> : path.label}</span>)}
            </div>
            <ul className="feature-ticks">
              <li>Real human Arabic voices across MSA, Gulf and Egyptian.</li>
              <li>English meanings and pronunciation guides</li>
              <li>Everyday scenes with clear outcomes</li>
              <li>A guided path from recognition to conversation</li>
            </ul>
            <ButtonLink href={siteConfig.routes.heyyusuf}>Discover HeyYusuf</ButtonLink>
            <Availability compact />
          </div>
        </div>
      </section>

      <section className="approach-section" id="approach" aria-labelledby="approach-title">
        <div className="page-shell">
          <div className="section-intro section-intro--split">
            <div>
              <p className="eyebrow eyebrow--dark">The learning approach</p>
              <h2 id="approach-title">Hear it. Say it. Use it.</h2>
            </div>
            <p>
              Each step adds just enough support to move a phrase from something
              you recognize to something you can use.
            </p>
          </div>
          <div className="approach-list">
            {approach.map((step) => (
              <article className="approach-step" key={step.number}>
                <p className="approach-step__number">{step.number}</p>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                {step.evidence}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="future-section" aria-labelledby="future-title">
        <div className="page-shell future-grid">
          <div>
            <p className="eyebrow eyebrow--dark">The wider family</p>
            <h2 id="future-title">First, Arabic. More companions to come.</h2>
          </div>
          <div className="future-copy">
            <p>
              HeyLanguages is building character-led learning for more languages.
              HeyPaul for French and HeyMarta for Spanish are future plans—not
              products you can download today.
            </p>
            <div className="future-names" aria-label="Future planned companions">
              <span><small>Now</small>HeyYusuf · Arabic</span>
              <span><small>Future</small>HeyPaul · French</span>
              <span><small>Future</small>HeyMarta · Spanish</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-final" aria-labelledby="home-final-title">
        <div className="page-shell home-final__inner">
          <Image
            alt="Yusuf, your Arabic learning guide"
            height={productAssets.yusuf.height}
            sizes="(max-width: 767px) 220px, 330px"
            src={productAssets.yusuf.src}
            width={productAssets.yusuf.width}
          />
          <div>
            <p className="eyebrow">Your first companion is ready to meet you</p>
            <h2 id="home-final-title">Come say hello to Yusuf.</h2>
            <p>See the Arabic learning experience, try a real phrase, and choose the variety that fits your goals.</p>
            <ButtonLink href={siteConfig.routes.heyyusuf}>Explore HeyYusuf</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
