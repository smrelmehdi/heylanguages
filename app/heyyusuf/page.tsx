import Image from "next/image";
import { AudioDemo } from "@/components/AudioDemo";
import { Availability } from "@/components/Availability";
import { ButtonLink } from "@/components/ButtonLink";
import { FAQ } from "@/components/FAQ";
import { createPageMetadata } from "@/lib/metadata";
import { audioSamples, everydayScenes, productAssets } from "@/lib/product";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "HeyYusuf | Learn Arabic with MSA, Egyptian and Gulf Lessons",
  absoluteTitle: true,
  description:
    "Learn useful Arabic with Yusuf through guided lessons, pronunciation practice, and everyday conversations in MSA, Egyptian, or Gulf Arabic.",
  path: siteConfig.routes.heyyusuf,
  image: "/heyyusuf/opengraph-image",
});

const teachingSteps = [
  {
    number: "01",
    title: "Meet useful language",
    body: "Start with words and phrases connected to a situation you can picture—not a disconnected vocabulary dump.",
    tag: "Words + meaning",
  },
  {
    number: "02",
    title: "Listen and practice",
    body: "Keep the Arabic, English meaning, and pronunciation guide together while you listen and practice speaking.",
    tag: "Audio + speaking",
  },
  {
    number: "03",
    title: "Use what you know",
    body: "Step into a guided exchange built from material you have already met, with context still close at hand.",
    tag: "Guided conversation",
  },
  {
    number: "04",
    title: "Reinforce and continue",
    body: "Simple assessments and a clear path help you revisit material and see what comes next.",
    tag: "Review + progress",
  },
];

const faqs = [
  {
    question: "Do I need to read Arabic first?",
    answer:
      "No. Beginner material pairs Arabic with an English meaning, a pronunciation guide, and audio so you can start before you are comfortable reading the script.",
  },
  {
    question: "Which Arabic option should I choose?",
    answer:
      "Choose Modern Standard Arabic for a formal variety used widely in writing, media, and structured settings; Egyptian for everyday speech centered on Egypt; or Gulf for practical Gulf speech with a UAE and Emirati-oriented direction. They are distinct choices, not interchangeable labels.",
  },
  {
    question: "What does a lesson involve?",
    answer:
      "You meet useful words and phrases, listen to them, practice recall or speaking, and then use familiar material in guided conversations and simple assessments.",
  },
  {
    question: "Can I start without an account?",
    answer:
      "Yes. You can complete the first three units in your chosen variety as a guest. Guest progress stays on that device. If you sign in on the same device, that progress is migrated into your account and can then use supported syncing.",
  },
  {
    question: "What is included with Premium?",
    answer:
      "Premium removes commercial locks from currently available lessons, scenarios, and practice as you progress. It also includes downloadable offline audio packs and online chat for signed-in members, subject to usage limits. An account is required to continue beyond the guest path; normal lesson order still applies.",
  },
  {
    question: "What works offline?",
    answer:
      "Premium learners can download an MSA, Egyptian, or Gulf audio pack and continue non-AI practice offline. Account syncing resumes after reconnecting. Chat, pronunciation checking, purchases, restore, and account deletion require a connection.",
  },
  {
    question: "Where can I get the app?",
    answer:
      "Public Android and iPhone releases are not yet confirmed. This page will show a verified store link for each platform independently when it is genuinely live.",
  },
];

export default function HeyYusufPage() {
  return (
    <main className="product-page" id="main-content">
      <section className="product-hero">
        <div className="product-hero__glow" aria-hidden="true" />
        <div className="page-shell product-hero__grid">
          <div className="product-hero__copy">
            <div className="product-lockup product-lockup--hero">
              <Image
                alt="HeyYusuf logo"
                height={58}
                priority
                src={productAssets.logo.src}
                width={58}
              />
              <span>HeyYusuf</span>
            </div>
            <p className="eyebrow">Learn Arabic with a guide</p>
            <h1>Your first Arabic conversation starts <em>here.</em></h1>
            <p className="product-hero__lede">
              Meet Yusuf. Learn useful Arabic through guided lessons,
              pronunciation practice, and everyday conversations. Choose Modern
              Standard Arabic, Egyptian, or Gulf Arabic.
            </p>
            <p className="reassurance"><span aria-hidden="true">✓</span> No Arabic reading experience needed to begin.</p>
            <div className="button-row">
              <ButtonLink href="#try-arabic">Try a little Arabic</ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary">See how it works</ButtonLink>
            </div>
            <Availability compact />
          </div>

          <div className="product-hero__visual">
            <div className="sample-lesson">
              <div className="sample-lesson__topline">
                <span>Sample lesson</span>
                <span>MSA</span>
              </div>
              <p className="sample-lesson__prompt">Choose and get ready</p>
              <p className="sample-lesson__arabic" dir="rtl" lang="ar">أي قميص تريد؟</p>
              <p className="sample-lesson__pronunciation">ayy qamiis turiid?</p>
              <p className="sample-lesson__english">Which shirt do you want?</p>
              <div className="sample-lesson__audio" aria-hidden="true">
                <span>▶</span>
                <i /><i /><i /><i /><i /><i /><i /><i />
              </div>
              <p className="sample-lesson__hint">Listen. Practice. Use it in the scene.</p>
            </div>
            <Image
              alt="Yusuf, the HeyYusuf Arabic guide"
              className="product-hero__yusuf"
              height={productAssets.yusuf.height}
              priority
              sizes="(max-width: 767px) 230px, 320px"
              src={productAssets.yusuf.src}
              width={productAssets.yusuf.width}
            />
            <span className="product-hero__phrase" dir="rtl" lang="ar">يلا نتعلم</span>
          </div>
        </div>
      </section>

      <section className="audio-section" id="try-arabic" aria-labelledby="audio-title">
        <div className="page-shell audio-section__grid">
          <div className="audio-section__intro">
            <p className="eyebrow eyebrow--dark">A website sample</p>
            <h2 id="audio-title">Try a little Arabic.</h2>
            <p>
              Hear how the same everyday question changes across three distinct
              Arabic choices. This is a small preview, not the full mobile course.
            </p>
            <div className="audio-context">
              <span>In this scene</span>
              <p>You are choosing what to wear. Yusuf asks: “Which shirt do you want?”</p>
            </div>
          </div>
          <AudioDemo />
        </div>
      </section>

      <section className="teaching-section" id="how-it-works" aria-labelledby="teaching-title">
        <div className="page-shell">
          <div className="section-intro section-intro--split section-intro--light">
            <div>
              <p className="eyebrow">Inside a lesson</p>
              <h2 id="teaching-title">From first phrase to guided conversation.</h2>
            </div>
            <p>
              The path gives beginners support early, then asks for more recall
              as familiar material returns in useful situations.
            </p>
          </div>
          <div className="teaching-grid">
            <div className="teaching-list">
              {teachingSteps.map((step) => (
                <article className="teaching-step" key={step.number}>
                  <span className="teaching-step__number">{step.number}</span>
                  <div>
                    <p className="teaching-step__tag">{step.tag}</p>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <figure className="product-screenshot">
              <div className="phone-frame phone-frame--product">
                <div className="phone-frame__bar" aria-hidden="true" />
                <Image
                  alt="HeyYusuf pronunciation practice with an Arabic phrase, pronunciation guide, audio playback, and speaking control"
                  height={productAssets.pronunciation.height}
                  sizes="(max-width: 767px) 78vw, 390px"
                  src={productAssets.pronunciation.src}
                  width={productAssets.pronunciation.width}
                />
              </div>
              <figcaption><span>Real app preview</span> Pronunciation practice in context</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="scenes-section" aria-labelledby="scenes-title">
        <div className="page-shell">
          <div className="section-intro section-intro--split">
            <div>
              <p className="eyebrow eyebrow--dark">Everyday scenes</p>
              <h2 id="scenes-title">Language has somewhere to go.</h2>
            </div>
            <p>
              Each scene gives new language a purpose. You are not memorizing a
              phrase in a vacuum—you are preparing to use it.
            </p>
          </div>
          <div className="scene-gallery">
            {everydayScenes.map((scene, index) => (
              <article className={`scene-card scene-card--${index + 1}`} key={scene.title}>
                <div className="scene-card__image">
                  <Image
                    alt={scene.alt}
                    fill
                    sizes="(max-width: 767px) 92vw, (max-width: 1023px) 45vw, 33vw"
                    src={scene.image.src}
                  />
                  <span>0{index + 1}</span>
                </div>
                <div className="scene-card__copy">
                  <h3>{scene.title}</h3>
                  <p>{scene.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dialects-section" aria-labelledby="dialects-title">
        <div className="page-shell">
          <div className="section-intro section-intro--split section-intro--light">
            <div>
              <p className="eyebrow">Choose your Arabic</p>
              <h2 id="dialects-title">Three clear paths. One friendly guide.</h2>
            </div>
            <p>
              Arabic changes by setting and region. Pick the variety that best
              matches where and how you hope to communicate.
            </p>
          </div>
          <div className="dialect-options">
            {audioSamples.map((sample, index) => (
              <article key={sample.id}>
                <p className="dialect-options__number">0{index + 1}</p>
                <p className="dialect-options__arabic" dir="rtl" lang="ar">{sample.arabic}</p>
                <h3>{sample.label}</h3>
                <p>{sample.description}</p>
                <a href="#try-arabic">Hear the sample <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
          <p className="dialects-section__note">
            These varieties are taught as distinct choices. HeyYusuf does not present one as a substitute for every Arabic-speaking situation.
          </p>
        </div>
      </section>

      <section className="beginner-section" aria-labelledby="beginner-title">
        <div className="page-shell beginner-grid">
          <div className="beginner-copy">
            <p className="eyebrow eyebrow--dark">Built for your first steps</p>
            <h2 id="beginner-title">Support when you need it. Less of it as you grow.</h2>
            <p>
              Begin with meaning, sound, and a clear visual cue. Keep moving
              through a structured path instead of wondering what to learn next.
            </p>
            <div className="beginner-note">
              <strong>Start free as a guest.</strong>
              <span>The first three units in each variety are free. Guest progress stays on that device; sign in there to migrate it to an account and continue further.</span>
            </div>
          </div>
          <dl className="support-list">
            <div><dt>See it</dt><dd>Arabic text, English meaning, and a pronunciation guide stay together.</dd></div>
            <div><dt>Hear it</dt><dd>Replay lesson audio when you need another listen.</dd></div>
            <div><dt>Practice it</dt><dd>Move from supported recall into guided speaking and conversation.</dd></div>
            <div><dt>Follow it</dt><dd>A visible learning path makes the next useful step clear.</dd></div>
          </dl>
        </div>
      </section>

      <section className="premium-section" aria-labelledby="premium-title">
        <div className="page-shell premium-grid">
          <div className="premium-badge" aria-hidden="true">
            <span>HeyYusuf</span>
            <strong>Premium</strong>
            <svg viewBox="0 0 120 120"><path d="m60 11 11 27 29-2-22 19 9 28-27-15-27 15 9-28-22-19 29 2 11-27Z" /></svg>
          </div>
          <div className="premium-copy">
            <p className="eyebrow eyebrow--dark">Premium</p>
            <h2 id="premium-title">More room to keep learning.</h2>
            <p>
              Premium removes commercial locks from currently available lessons,
              scenarios, and practice as you progress. Account gates and lesson
              order still apply.
            </p>
            <ul className="premium-list">
              <li>Premium lessons, scenarios, and practice in the learning path</li>
              <li>Downloadable dialect audio packs and non-AI practice offline</li>
              <li>Online chat for signed-in Premium members, with usage limits</li>
            </ul>
            <p className="premium-caveat">
              A free start is available. Premium is a monthly, store-managed subscription. Public pricing and purchase links will appear only after release availability is verified; no web checkout is offered.
            </p>
            <Availability />
          </div>
        </div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div className="page-shell faq-grid">
          <div className="faq-intro">
            <p className="eyebrow eyebrow--dark">Questions, answered</p>
            <h2 id="faq-title">A clear start matters.</h2>
            <p>Practical answers for choosing a variety, beginning as a guest, and understanding what is available.</p>
            <ButtonLink href={siteConfig.routes.support} variant="dark">Visit support</ButtonLink>
          </div>
          <FAQ items={faqs} />
        </div>
      </section>

      <section className="product-final" aria-labelledby="product-final-title">
        <div className="page-shell product-final__inner">
          <div>
            <p className="eyebrow">One useful phrase is a good place to begin.</p>
            <h2 id="product-final-title">Start your first Arabic conversation.</h2>
            <p>Try the sample now. When the public app release is verified, the correct store link will appear here.</p>
            <div className="button-row">
              <ButtonLink href="#try-arabic">Hear the Arabic sample</ButtonLink>
              <ButtonLink href={siteConfig.routes.support} variant="secondary">Ask a question</ButtonLink>
            </div>
          </div>
          <Image
            alt="Yusuf welcoming you to learn Arabic"
            height={productAssets.yusuf.height}
            sizes="(max-width: 767px) 220px, 330px"
            src={productAssets.yusuf.src}
            width={productAssets.yusuf.width}
          />
        </div>
      </section>
    </main>
  );
}
