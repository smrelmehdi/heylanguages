import type { ReactNode } from "react";

type NoticeProps = {
  title?: string;
  children: ReactNode;
  tone?: "default" | "warning";
};

export function Notice({ title, children, tone = "default" }: NoticeProps) {
  const toneClass =
    tone === "warning"
      ? "border-amber/45 bg-amber/12 text-cream"
      : "border-line bg-cream/5 text-muted";

  return (
    <div className={`rounded-lg border p-5 ${toneClass}`}>
      {title ? <p className="font-semibold text-cream">{title}</p> : null}
      <div className={title ? "mt-2 text-sm leading-6" : "text-sm leading-6"}>
        {children}
      </div>
    </div>
  );
}
