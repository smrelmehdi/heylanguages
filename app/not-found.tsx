import { ButtonLink } from "@/components/ButtonLink";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-cream">Page not found.</h1>
      <p className="mt-4 text-muted">
        The page you are looking for is not available on HeyLanguages.
      </p>
      <div className="mt-8 flex justify-center">
        <ButtonLink href={siteConfig.routes.home}>Back to home</ButtonLink>
      </div>
    </main>
  );
}
