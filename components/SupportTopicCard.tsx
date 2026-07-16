import type { ReactNode } from "react";

type SupportTopicCardProps = {
  title: string;
  children: ReactNode;
};

export function SupportTopicCard({ title, children }: SupportTopicCardProps) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-6">
      <h2 className="text-xl font-semibold text-cream">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-muted">{children}</div>
    </section>
  );
}
