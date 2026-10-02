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
- Official store badge assets when a verified public release is live
- Public Premium price only when store-local pricing is appropriate to show
- Legal last-updated date

## Legal Pages

Legal pages live under `app/heyyusuf/privacy`, `app/heyyusuf/terms`, and
`app/heyyusuf/delete-account`.

When legal text changes, update `legalLastUpdated` in `lib/site.ts`.

## Store Links

Android and iPhone default to `coming-soon`. When a public listing is verified,
update that platform in `siteConfig.availability` with `state: "available"`, its
public `storeUrl`, and the matching official `badgeSrc`. Each platform can go
live independently.
