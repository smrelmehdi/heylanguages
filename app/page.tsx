import { FeatureCard, ProductCard } from "@/components/Cards";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Language learning for real conversations",
  description:
    "HeyLanguages builds practical language-learning apps for real conversations, starting with HeyYusuf for Arabic.",
  path: siteConfig.routes.home,
});

const principles = [
  {
    title: "Useful before impressive",
    body: "Lessons focus on words and situations people actually need, from greetings to everyday errands.",
  },
  {
    title: "Speech matters",
    body: "Practice is designed around hearing, repeating, and getting comfortable with natural spoken language.",
  },
  {
    title: "Built for momentum",
    body: "Short sessions, clear progress, and practical review keep learning manageable on busy days.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(217,154,61,0.18),transparent_30rem)]" />
        <div className="absolute inset-x-5 top-10 -z-10 mx-auto grid max-w-6xl gap-4 opacity-30 md:grid-cols-3" aria-hidden="true">
          {["أهلاً وسهلاً", "الحساب لو سمحت", "يلا نتعلم"].map((text) => (
            <div className="rounded-lg border border-line bg-panel/70 p-5 text-right text-3xl text-cream" dir="rtl" key={text}>
              {text}
            </div>
          ))}
        </div>
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-5 py-16 md:py-24">
          <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber">
            HeyLanguages
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-cream md:text-7xl">
            Language learning for real conversations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            HeyLanguages creates practical language-learning products for people
            who want to speak with more confidence in everyday situations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={siteConfig.routes.heyyusuf}>
              Explore HeyYusuf
            </ButtonLink>
            <ButtonLink href={siteConfig.routes.support} variant="secondary">
              Get support
            </ButtonLink>
          </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-panel/34">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            eyebrow="Product"
            title="Start with HeyYusuf."
            description="HeyYusuf is the first HeyLanguages product: a mobile app for practical Arabic learning."
          />
          <div className="mt-10">
            <ProductCard
              title="HeyYusuf"
              subtitle="Arabic that belongs in real life."
              description="Learn useful Arabic through short lessons, realistic scenarios, local audio, and speaking practice built for daily progress."
              chips={["Arabic varieties", "Scenario practice", "Pronunciation support", "Offline-friendly packs"]}
              href={siteConfig.routes.heyyusuf}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          eyebrow="Principles"
          title="Small lessons, honest product."
          description="V1 is intentionally focused: clear learning, transparent pricing, and no fake launch claims."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <FeatureCard key={principle.title} title={principle.title}>
              {principle.body}
            </FeatureCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-lg border border-line bg-amber/10 p-8 md:p-10">
          <h2 className="text-3xl font-semibold text-cream">Start with Arabic.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            HeyYusuf is launching first on Android with free starter content and
            optional Premium access for deeper learning.
          </p>
          <div className="mt-7">
            <ButtonLink href={siteConfig.routes.heyyusuf}>
              Explore HeyYusuf
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
