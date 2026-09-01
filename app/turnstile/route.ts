import type { NextRequest } from "next/server";

const SITE_KEY_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;
const ATTEMPT_PATTERN = /^[1-9][0-9]*$/;

const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  "connect-src https://challenges.cloudflare.com",
].join("; ");

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "Content-Type": "text/html; charset=utf-8",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function renderPage(siteKey: string | null) {
  const challengeScript = siteKey
    ? `
    <script
      id="turnstile-api"
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&amp;render=explicit"
      defer
    ></script>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HeyYusuf Security Check</title>
    <link rel="stylesheet" href="/turnstile.css">
    <script src="/turnstile-client.js" defer></script>${challengeScript}
  </head>
  <body>
    <main>
      <h1>HeyYusuf Security Check</h1>
      <div
        id="turnstile-widget"
        data-valid="${siteKey ? "true" : "false"}"
        ${siteKey ? `data-sitekey="${siteKey}"` : ""}
      ></div>
    </main>
  </body>
</html>`;
}

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const siteKeys = request.nextUrl.searchParams.getAll("sitekey");
  const attempts = request.nextUrl.searchParams.getAll("attempt");
  const siteKey = siteKeys.length === 1 ? siteKeys[0] : null;
  const attempt = attempts.length === 1 ? attempts[0] : null;
  const isValid =
    siteKey !== null &&
    attempt !== null &&
    SITE_KEY_PATTERN.test(siteKey) &&
    ATTEMPT_PATTERN.test(attempt);

  return new Response(renderPage(isValid ? siteKey : null), {
    headers: RESPONSE_HEADERS,
    status: isValid ? 200 : 400,
  });
}
