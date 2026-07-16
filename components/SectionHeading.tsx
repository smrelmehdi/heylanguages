type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
