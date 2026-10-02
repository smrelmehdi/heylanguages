type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  as = "h2",
}: SectionHeadingProps) {
  const Heading = as;
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="text-3xl font-semibold tracking-tight text-cream md:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
