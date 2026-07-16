import { FAQ } from "@/components/FAQ";
import { FeatureCard } from "@/components/Cards";
import { ButtonLink } from "@/components/ButtonLink";
import { Notice } from "@/components/Notice";
import { SectionHeading } from "@/components/SectionHeading";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "HeyYusuf Arabic App",
  description:
    "HeyYusuf helps learners practice practical Arabic through lessons, scenarios, audio, and pronunciation support.",
  path: siteConfig.routes.heyyusuf,
});

const features = [
  {
    title: "Everyday lessons",
    body: "Start with words, phrases, and short practice built around situations you can recognize quickly.",
  },
  {
    title: "Scenario practice",
    body: "Work through restaurants, taxis, shops, pharmacies, and other common moments with guided dialogue.",
  },
  {
    title: "Pronunciation-focused audio",
    body: "Hear clean local audio and repeat it so the phrase feels usable, not just readable.",
  },
  {
    title: "Premium practice",
    body: "Premium unlocks all currently available lessons and practice activities.",
  },
];

const faqs = [
  {
    question: "Is HeyYusuf available now?",
    answer:
      "HeyYusuf is preparing for launch and is planned to launch first on Android.",
  },
  {
    question: "Which Arabic does HeyYusuf teach?",
    answer:
      "HeyYusuf is built around practical Arabic varieties for real situations, with content organized so learners can choose the variety they want to practice where available.",
  },
  {
    question: "Is there free content?",
    answer:
      "Yes. V1 includes free starter content, including selected lessons and scenarios. Premium unlocks all currently available lessons and practice activities.",
  },
  {
    question: "How do subscriptions work?",
    answer:
      "Premium subscriptions are managed by the Apple App Store or Google Play. Renewal, cancellation, and refunds are handled through the store account used to purchase.",
  },
];

export default function HeyYusufPage() {
  return (
    <main>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(217,154,61,0.16),transparent_28rem)]" />
        <div className="absolute inset-x-5 bottom-10 -z-10 mx-auto grid max-w-6xl gap-3 opacity-35 md:grid-cols-3" aria-hidden="true">
          {["إزيك؟", "وين المطعم؟", "الحساب لو سمحت"].map((text) => (
            <div className="rounded-lg border border-line bg-panel/70 px-5 py-4 text-right text-2xl text-cream" dir="rtl" key={text}>
              {text}
            </div>
          ))}
        </div>
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-5 py-16 md:py-24">
          <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber">
            HeyYusuf
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-cream md:text-7xl">
            Arabic that belongs in real life.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            A mobile Arabic-learning app for everyday words, useful scenarios,
            listening, speaking, and practical review.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={siteConfig.routes.support}>Coming soon</ButtonLink>
            <ButtonLink href={siteConfig.routes.privacy} variant="secondary">
              Privacy details
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-muted">{siteConfig.androidLaunchStatus}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-panel/34">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            eyebrow="Features"
            title="Focused on practical Arabic."
            description="HeyYusuf keeps V1 narrow and useful: learn, listen, repeat, and practice short real-world dialogues."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title}>
                {feature.body}
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-3xl">
          <Notice title="Free and Premium">
            HeyYusuf is free to download. V1 includes selected free lessons and
            scenarios. Monthly Premium unlocks all currently available lessons
            and practice activities. Subscriptions are store-managed and
            auto-renew until cancelled through Apple or Google.
          </Notice>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <SectionHeading
          eyebrow="FAQ"
          title="Plain answers before launch."
          description="A few practical details for early users and store review."
        />
        <div className="mt-8">
          <FAQ items={faqs} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-lg border border-line bg-amber/10 p-8 md:p-10">
          <h2 className="text-3xl font-semibold text-cream">
            Built by HeyLanguages.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            HeyYusuf is the first product in a broader family of language
            learning tools for practical communication.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={siteConfig.routes.support}>Contact support</ButtonLink>
            <ButtonLink href={siteConfig.routes.terms} variant="secondary">
              Read terms
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
