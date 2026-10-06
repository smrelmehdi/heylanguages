# HeyLanguages Website

Official V1 website for HeyLanguages and the first product, HeyYusuf.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready static/server-rendered pages

The site does not require environment variables and does not include analytics,
cookies, authentication, payment SDKs, or a backend.

## Local Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```

## Deployment on Vercel

1. Create a Vercel project from the repository.
2. Use the repository root as the Vercel project root.
3. Use the default Next.js build settings. Do not use static export: the
   `/turnstile` route requires request-time rendering.
4. Deploy.
5. Connect `heylanguages.com` in Vercel project settings.
6. Configure DNS with your domain provider outside this repository.

## Configuration

Central website constants live in `lib/site.ts`.

Update these values there:

- Domain
- Support email
- Independent Android and iPhone release states and store URLs
- Optional official store badge assets for verified public releases
- Public Premium price only when store-local pricing is appropriate to show
- Legal last-updated date

## Legal Pages

Legal pages live under `app/heyyusuf/privacy`, `app/heyyusuf/terms`, and
`app/heyyusuf/delete-account`.

When legal text changes, update `legalLastUpdated` in `lib/site.ts`.

## Store Links

Android is live with `state: "available"` and the confirmed Google Play URL:
https://play.google.com/store/apps/details?id=com.heylanguages.heyyusuf

iPhone remains `coming-soon`, with no App Store URL. Only update it when its
public listing is confirmed; do not infer iOS availability from Android.

Release state and badge artwork are independent. A live platform with a verified
`storeUrl` renders a download link even when `badgeSrc` is null. Official badge
artwork can be added later without changing availability.

Keep product copy and SoftwareApplication JSON-LD in `app/heyyusuf/page.tsx`
consistent with confirmed platform availability. When changing public content,
update only the affected pages' modification dates in `app/sitemap.ts`.

## Blog authoring

The blog uses typed article files in `content/blog/` and server-rendered Next.js
pages. There is no CMS, MDX compiler, or client-side content fetch. Register each
article in `content/blog/index.ts`; its metadata and body share one source.

1. Add a `.ts` file exporting an object that `satisfies BlogPost` (from
   `lib/blog-types.ts`). Use a unique lowercase, hyphenated `slug` and start with
   `status: "draft"`.
2. Set the title, unique SEO title, description, short excerpt, category, actual
   author (`Person` or `Organization`), and accurate `dateModified` (`YYYY-MM-DD`).
   Do not assign a publication date to a draft.
3. Write `body` blocks: paragraph, H2/H3 heading with a unique anchor ID, list,
   Arabic with transliteration/translation, accessible table, callout, or image.
   Inline content supports text, links, emphasis, strong text, and RTL Arabic.
   Link naturally to relevant guides or `/heyyusuf` sections. The template adds
   a quiet HeyYusuf practice link near the end.
4. Keep image assets in `public/`, provide real dimensions and descriptive alt
   text, and reference them by root-relative path. Optional top-level `image`
   supplies social/schema imagery; body image blocks control visible placement.
   Without one, social cards use the existing site image and JSON-LD omits image.
5. Preview with `npm run dev` at `/blog/<slug>`. Drafts appear in a clearly marked
   development-only section of `/blog`, carry `noindex, nofollow`, never enter
   the sitemap, and return 404 in production. The single `layout-sample` draft
   exercises the template; it is not the first article and must stay a draft.
6. After editorial review, set `status: "published"` and the actual
   `datePublished`; set `dateModified` to that date initially and update it only
   for substantive edits. Publication is explicit, not scheduled: do not use
   future dates. Rebuild/deploy to publish changes. Cards, static routes, SEO,
   BlogPosting JSON-LD, and sitemap entries are derived automatically.

Reading time is an estimate from visible body text at 200 words/minute. Dates
use a fixed UTC formatter so they do not shift with the server's timezone.
Published articles require both dates; local draft JSON-LD omits datePublished.
Never add invented credentials, reviews, statistics, or schema-only claims.

Before publication, run `npm run lint`, `npm run build`, and
`npx tsc --noEmit --incremental false`. Check the article on mobile and desktop,
its metadata and JSON-LD, and `/sitemap.xml`. If the index introduction changes,
update `blogUpdated` in `lib/blog.ts`; article modifications update the index's
sitemap date automatically.

## HeyYusuf learning paths and entity IDs

`lib/product.ts` owns the three learning paths, display names, descriptions,
real sample text/audio, and reserved future page slugs. Reuse `learningPaths`
and the derived product descriptions rather than maintaining separate lists.
`futureSlug` reserves each dedicated page URL. Set `pageLastModified` only once
the page is implemented and approved for publication; this enables its homepage
and product links and sitemap entry. Gulf Arabic and Egyptian Arabic are implemented; MSA
remains unlinked and excluded. Update that date for substantive page changes.

Samples use `/heyyusuf#try-arabic-msa`, `#try-arabic-gulf`, and
`#try-arabic-egyptian`. Path-card links, direct visits, player tabs, and browser
history share this state. The original `#try-arabic` section link still works.
Changing a sample stops playback; links never start audio automatically.

`lib/entities.ts` owns the permanent Organization and SoftwareApplication IDs.
The root layout defines HeyLanguages once per document. App publisher and
HeyLanguages-authored blog schema reference that same Organization ID. Learning
paths belong to one app; they must not become separate SoftwareApplication entities.

The Gulf and Egyptian pages reuse `AudioDemo` with `pathId="gulf"` and
`pathId="egyptian"` respectively, rendering the real sample on the server and
keeping playback fixed to the chosen path. The product overview
continues to offer all three tabs and their shareable sample anchors.
