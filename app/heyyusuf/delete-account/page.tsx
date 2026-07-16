import { Notice } from "@/components/Notice";
import { createPageMetadata } from "@/lib/metadata";
import { mailtoSupport, siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Delete Your HeyYusuf Account",
  description:
    "Request deletion of your HeyYusuf account and understand what deletion does and does not remove.",
  path: siteConfig.routes.deleteAccount,
});

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14 md:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber">
        Account deletion
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-cream md:text-5xl">
        Delete your HeyYusuf account.
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted">
        You can request deletion of your HeyYusuf account by emailing
        HeyLanguages from the email address connected to your account.
      </p>

      <div className="mt-10 rounded-lg border border-line bg-panel/82 p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-semibold text-cream">How to request deletion</h2>
        <ol className="mt-5 space-y-4 pl-5 text-muted">
          <li>
            Email{" "}
            <a className="text-amber hover:text-cream" href={mailtoSupport("Delete HeyYusuf Account")}>
              dev@heylanguages.com
            </a>{" "}
            from the email address linked to your HeyYusuf account.
          </li>
          <li>
            Use the subject line{" "}
            <strong className="text-cream">HeyYusuf Account Deletion Request</strong>.
          </li>
          <li>
            Include enough information for us to identify the account, but do
            not include passwords or sensitive payment details.
          </li>
          <li>
            Identity verification may be required before we process the request.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <Notice title="Important subscription warning">
          Deleting your HeyYusuf account does not cancel an active Apple App
          Store or Google Play subscription. You must cancel subscriptions
          through your relevant store account.
        </Notice>
      </div>

      <div className="mt-8 rounded-lg border border-line bg-panel/70 p-6">
        <h2 className="text-2xl font-semibold text-cream">What may be deleted</h2>
        <p className="mt-3 leading-7 text-muted">
          Account profile, preferences, XP, lesson progress, and linked learning
          data will normally be deleted or anonymized after a verified request.
        </p>
        <p className="mt-4 leading-7 text-muted">
          Limited records may be retained for legal, security, fraud-prevention,
          transaction, tax, or dispute obligations. Backups may persist until
          overwritten through normal retention cycles.
        </p>
        <p className="mt-4 leading-7 text-muted">
          Verified requests will be processed within a reasonable period. Apple,
          Google, and RevenueCat may retain independently controlled transaction
          records. Subscription cancellation and refunds follow the store
          policies.
        </p>
      </div>
    </main>
  );
}
