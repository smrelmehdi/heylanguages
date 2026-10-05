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
