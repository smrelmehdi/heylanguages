import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      aria-label="HeyLanguages home"
      className={`brand-mark ${footer ? "brand-mark--footer" : ""}`}
      href={siteConfig.routes.home}
    >
      <Image
        alt=""
        aria-hidden="true"
        height={42}
        priority={!footer}
        src="/icon.svg"
        width={42}
      />
      <span>HeyLanguages</span>
    </Link>
  );
}
