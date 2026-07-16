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
npm install
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
2. Set the project root to `website`.
3. Use the default Next.js build settings.
4. Deploy.
5. Connect `heylanguages.com` in Vercel project settings.
6. Configure DNS with your domain provider outside this repository.

## Configuration

Central website constants live in `lib/site.ts`.

Update these values there:

- Domain
- Support email
- Google Play link when available
- Android launch wording
- Legal last-updated date

## Legal Pages

Legal pages live under `app/heyyusuf/privacy`, `app/heyyusuf/terms`, and
`app/heyyusuf/delete-account`.

When legal text changes, update `legalLastUpdated` in `lib/site.ts`.

## Google Play Link

When the HeyYusuf Google Play listing is live, set `googlePlayUrl` in
`lib/site.ts` and update any launch CTA copy that should point to the store.
