# HeyLanguages website redesign handoff

> Launch-status update (2026-10-05): The HeyYusuf launch-status information below
> is superseded. Android is live on [Google Play](https://play.google.com/store/apps/details?id=com.heylanguages.heyyusuf);
> iPhone remains coming soon with no App Store URL. This report and its QA
> artifacts are preserved as a historical record of the redesign.

## Baseline and direction

- Website root: `/Users/mehdi/Desktop/HeyLanguages`
- Branch: `main`
- Baseline HEAD: `2d2007f52e59b97f83f729d90b26e163d697bdf1`
- Baseline worktree: only pre-existing untracked `.DS_Store`
- Mobile reference: `/Users/mehdi/Desktop/HeyYusuf`, branch
  `v2/stable-runtime-integration`, HEAD
  `970a3f33ab9ac75eb50b3b496fecdc51ba7ab110` (inspected read-only;
  tracked worktree remains unchanged)
- Framework: Next.js 16 App Router, React 19, TypeScript, Tailwind, npm,
  default Vercel/Node deployment. The redesign was built on Next.js `16.2.10`
  and security-upgraded to `16.3.5` on 2026-09-19. Static export must not be
  enabled because the operational `/turnstile` route is request-time rendered.
- Design direction: warm editorial ivory and restrained gold for the parent
  brand; deep ink and app teal for the HeyYusuf product experience; approved
  Yusuf/scene art and visible lesson evidence instead of generic SaaS cards.

## Changed source files

- `README.md`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/opengraph-image.tsx`
- `app/sitemap.ts`
- `app/heyyusuf/page.tsx`
- `app/heyyusuf/opengraph-image.tsx` (new)
- `app/heyyusuf/support/page.tsx` (semantic H1 only; support copy preserved)
- `components/AudioDemo.tsx` (new)
- `components/Availability.tsx` (new)
- `components/BrandMark.tsx` (new)
- `components/ButtonLink.tsx`
- `components/FAQ.tsx`
- `components/Footer.tsx`
- `components/Header.tsx`
- `components/MobileMenu.tsx` (new)
- `components/SectionHeading.tsx`
- `lib/metadata.ts`
- `lib/product.ts` (new centralized product copy/media data)
- `lib/site.ts` (central availability, routes, contact, pricing state)
- `scripts/browser-qa.mjs` (new reproducible Chrome/axe QA harness)
- `reports/screenshots/browser-qa.json` and the PNGs listed below
- `reports/website-redesign-handoff.md` (this file)

## Security upgrade: Next.js 16.2.10 to 16.3.5

The upgrade started on branch `main` at HEAD
`2d2007f52e59b97f83f729d90b26e163d697bdf1`. The approved redesign worktree
was already uncommitted; `package.json` and `package-lock.json` were clean at
the security-upgrade baseline. npm with lockfile version 3 is the repository's
only package manager. The local verification runtime was Node `24.16.0` and npm
`11.13.0`.

| Package | Before | After |
| --- | --- | --- |
| `next` | manifest `^16.2.10`, resolved `16.2.10` | manifest and resolved `16.3.5` |
| `react` | `19.0.0` | `19.0.0` (unchanged) |
| `react-dom` | `19.0.0` | `19.0.0` (unchanged) |
| `eslint-config-next` | resolved `16.2.10` | `16.2.10` (unchanged) |

Next.js `16.3.5` was the current stable 16.3.x release and is newer than the
official `16.3.3` security floor. React and React DOM already satisfy its peer
range, so no React upgrade was needed. `eslint-config-next` has no peer
requirement forcing a matching patch and continued to lint successfully, so it
was intentionally left unchanged under the narrow-upgrade constraint.

The lockfile changed only for Next.js and dependencies selected by its updated
tree: `@next/env` and the platform SWC packages moved to `16.3.5`,
`@swc/helpers` to `0.5.23`, PostCSS to `8.5.23`, and Sharp plus its platform
packages to `0.35.4`/libvips `1.3.3`. Two vulnerable transitive versions already
allowed by those ranges were also refreshed: `baseline-browser-mapping` to
`2.11.25` and `nanoid` to `3.3.19`. No new direct dependency was added.

Official 16.3 guidance says its existing-project improvements require no app
code changes. This project already meets the relevant compatibility constraints:
Node is above `20.9`, TypeScript is above `5.1`, request APIs are not used
synchronously, and there is no middleware, custom webpack configuration,
parallel route, Cache Components configuration, or queried local image source
requiring migration. New Instant Navigation features remain opt-in and were not
enabled. Sources: [Next.js 16.3](https://nextjs.org/blog/next-16-3),
[August security release](https://nextjs.org/blog/august-2026-security-release),
and [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16).

Exact security-upgrade files:

- `package.json`
- `package-lock.json`
- `reports/website-redesign-handoff.md`
- `reports/screenshots/browser-qa.json` and the ten PNG captures (regenerated
  from the upgraded production build)

No application source, copy, CSS, route, legal/support behavior, availability
state, image, or audio file was changed for compatibility.

## Added website assets and provenance

Optimized derivatives only were added; mobile originals were not modified.

| Website asset | Approved/reference source |
| --- | --- |
| `public/product/heyyusuf-logo.png` | `HeyYusuf/assets/images/logo.png` |
| `public/product/yusuf-welcome.png` | `HeyYusuf/assets/images/yusuf-welcome.png` |
| `public/product/app-pronunciation.jpg` | Optimized from `HeyYusuf/reports/app-store-screenshots/04-pronunciation.png`; used only as a generic real-app pronunciation preview |
| `public/scenes/cafe-conversation.webp` | `HeyYusuf/assets/images/cafe-bg.webp`, approved V2 scene registry |
| `public/scenes/finding-belongings.jpg` | Optimized from `HeyYusuf/assets/images/cairo-finding-belongings-interior.png`, approved V2 scene registry |
| `public/scenes/choosing-clothes.jpg` | Optimized from `HeyYusuf/assets/images/cairo-clothing-choice-interior.png`, approved V2 scene registry |
| `public/audio/msa-which-shirt.mp3` | `HeyYusuf/assets/audio/v2/msa/e24860bdc3614a6e9ffb.mp3` (1.520 s; approved bundled runtime file) |
| `public/audio/egyptian-which-shirt.mp3` | `HeyYusuf/assets/audio/v2/egyptian/beginner-which-shirt-qa-r2.mp3` (1.802 s; human-approved installed runtime file) |
| `public/audio/gulf-which-shirt.mp3` | `HeyYusuf/assets/audio/v2/gulf/beginner-which-shirt.mp3` (1.332 s; human-approved installed runtime file) |

The three audio samples are true equivalents of “Which shirt do you want?” and
use approved visible Arabic rather than TTS-control spelling. No candidate or
rejected audio was copied.

## Preserved routes and behavior

- `/heyyusuf/privacy`
- `/heyyusuf/terms`
- `/heyyusuf/support`
- `/heyyusuf/delete-account`
- `/turnstile` plus `public/turnstile-client.js` and `public/turnstile.css`
- `/robots.txt`, `/sitemap.xml`, icons, root/product Open Graph images

Legal, deletion, subscription, retention, and support-email text was not
rewritten. Shared header/footer styling now wraps those pages, and the Support
title was corrected from an H2 to the page H1. Invalid `/turnstile` requests
still return 400 with `Cache-Control: no-store`.

## Launch configuration

`lib/site.ts` is the single launch-state source. Android and iPhone are
independent and currently use:

```ts
state: "coming-soon"
storeUrl: null
badgeSrc: null
```

When a public listing is genuinely live, change only that platform to
`state: "available"`, add its verified public `storeUrl`, and add the matching
official store-badge asset path as `badgeSrc`. The UI will replace that
platform's status label with a working linked badge while leaving the other
platform unchanged. `siteConfig.premium.publicPrice` remains `null`; the app
uses store-localized monthly pricing and no authoritative public numeric price
was found in tracked source. No waitlist, web checkout, test APK, or closed-test
link was added.

## Verification results

- `npm install next@16.3.5 --save-exact`: pass
- `npm ci`: pass from the updated lockfile
- `npm run lint`: pass
- `npx tsc --noEmit`: pass
- `npm run build`: pass on Next.js `16.3.5`; marketing/legal/SEO routes
  prerender statically and `/turnstile` remains dynamic
- `npm audit --omit=dev`: zero production vulnerabilities
- `git diff --check`: pass
- Chrome production-preview QA: pass at 360, 390, 768, 1024, and 1440 px for
  both pages; no horizontal overflow, broken images, empty links, console
  warnings/errors, or hydration exceptions
- Dedicated Chrome loads of Privacy, Terms, Support, and Delete Account at
  1024 px also had no overflow, broken images, console warnings/errors, or
  hydration exceptions
- axe-core automated accessibility checks: zero violations on both pages at
  390 and 1440 px after the contrast refinement
- 200% text-size check: no horizontal overflow; content remains scrollable
- Reduced motion: media query active and transitions reduced to effectively 0
- Audio: MSA/Egyptian/Gulf tabs update phrase, pronunciation, meaning, and
  audio together; explicit play works; changing variety and leaving the section
  stop playback
- FAQ: native keyboard-operable disclosure opens correctly
- Mobile navigation: opens as a modal dialog, traps focus, closes with Escape,
  and returns focus to the trigger
- All required support/legal routes, sitemap, robots, and both Open Graph image
  routes returned 200. A valid `/turnstile` request returned 200 with the
  expected CSP and security headers; an invalid request returned 400. Both were
  `Cache-Control: no-store`.
- Visual regression review: no regression. All approved dimensions and page
  heights remained exact. The HeyYusuf hero, audio state, mobile menu, 200%
  text, Support view, and a repeated homepage full-page capture were
  byte-for-byte identical to the preserved pre-upgrade captures. Small
  non-reproducible differences in other full-page PNGs were confined to the
  harness's smooth-scroll/sticky-header capture timing and were manually
  reviewed; content, geometry, imagery, and styling are unchanged.

Detailed machine-readable results: `reports/screenshots/browser-qa.json`.

## Screenshots

- `reports/screenshots/home-1440-hero.png`
- `reports/screenshots/home-1440-full.png`
- `reports/screenshots/home-390-full.png`
- `reports/screenshots/heyyusuf-1440-hero.png`
- `reports/screenshots/heyyusuf-1440-full.png`
- `reports/screenshots/heyyusuf-390-full.png`
- `reports/screenshots/heyyusuf-audio-sample-1024.png`
- `reports/screenshots/home-mobile-menu-390.png`
- `reports/screenshots/heyyusuf-text-200-390.png`
- `reports/screenshots/support-1024.png`

## Remaining unverified items

The Next.js production deployment blocker is resolved. The full development
dependency audit still reports three high-severity findings in build/lint-only
transitives (`brace-expansion`, `browserslist`, and `js-yaml`); the production
audit is clean. They were not changed because this task explicitly excluded
unrelated dependency upgrades and they are not shipped in the production tree.

1. Public Android and iPhone production listings remain unverified, so both
   stay “Coming soon.”
2. A public numeric Premium price remains unverified and is intentionally
   omitted.
3. The browsing service could not reach the live domain, so live-vs-local
   visual comparison was unavailable. All implementation QA used the local
   production build.
4. The pronunciation capture is the safest available real UI evidence but is
   untracked in the mobile worktree and predates final V2 activation. It is
   labeled generically; reconfirm or replace it before release marketing if a
   newer approved capture becomes available.
5. No Lighthouse/Core Web Vitals lab run was made, so no performance score or
   field-metric claim is reported.

## Local preview

The production preview is currently available at `http://localhost:3100`.

To reproduce it:

```bash
npm ci
npm run build
npm start -- -p 3100
```

No commit, push, production deployment, mobile-app edit, store-console change,
or DNS change was made.
