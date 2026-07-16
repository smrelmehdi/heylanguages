import type { ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type FeatureCardProps = {
  title: string;
  children: ReactNode;
};

export function FeatureCard({ title, children }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-line bg-panel/82 p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-cream">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{children}</p>
    </article>
  );
}

type ProductCardProps = {
  title: string;
  subtitle: string;
  description: string;
  chips: string[];
  href: string;
};

export function ProductCard({
  title,
  subtitle,
  description,
  chips,
  href,
}: ProductCardProps) {
  return (
    <article className="grid gap-7 rounded-lg border border-line bg-panel/82 p-6 shadow-soft md:grid-cols-[1fr_1.1fr] md:p-8">
      <div className="rounded-lg border border-amber/25 bg-amber/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber">
          First product
        </p>
        <h3 className="mt-4 text-3xl font-semibold text-cream">{title}</h3>
        <p className="mt-3 text-lg text-cream/86">{subtitle}</p>
        <div className="mt-8 rounded-lg border border-line bg-ink/60 p-5">
          <p className="text-right text-3xl leading-relaxed text-cream" dir="rtl">
            أهلاً، يلا نتعلم
          </p>
          <p className="mt-3 text-sm text-muted">Useful Arabic, short lessons.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-base leading-7 text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              className="rounded-full border border-line bg-cream/5 px-3 py-2 text-sm text-muted"
              key={chip}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-7">
          <ButtonLink href={href}>Explore HeyYusuf</ButtonLink>
        </div>
      </div>
    </article>
  );
}
