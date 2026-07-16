type FAQItem = {
  question: string;
  answer: string;
};

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details
          className="group rounded-lg border border-line bg-panel/76 p-5"
          key={item.question}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-cream">
            {item.question}
            <span
              aria-hidden="true"
              className="text-amber transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-4 text-sm leading-6 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
