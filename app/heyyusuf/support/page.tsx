import { Notice } from "@/components/Notice";
import { SectionHeading } from "@/components/SectionHeading";
import { SupportTopicCard } from "@/components/SupportTopicCard";
import { createPageMetadata } from "@/lib/metadata";
import { mailtoSupport, siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "HeyYusuf Support",
  description:
    "Get support for HeyYusuf accounts, subscriptions, restore purchases, offline packs, pronunciation, and account deletion.",
  path: siteConfig.routes.support,
});

const topics = [
  {
    title: "Account and sign-in",
    body: "For help with guest use, signing in, or account access, email support with the device type and app version if available.",
  },
  {
    title: "Premium and subscriptions",
    body: "Premium is managed through Apple App Store or Google Play. Use Restore Purchases in the app if Premium does not appear after purchase.",
  },
  {
    title: "Offline packs",
    body: "Downloaded packs may require Premium access and enough device storage. Try reconnecting, reopening the app, and downloading again if a pack fails.",
  },
  {
    title: "Audio or pronunciation",
    body: "Check volume, silent mode, microphone permission, and network state. Some pronunciation features may need online processing.",
  },
  {
    title: "Billing and refunds",
    body: "Apple and Google handle billing, cancellation, and refunds for subscriptions purchased through their stores.",
  },
  {
    title: "Delete account",
    body: "You can request deletion from the account deletion page. Account deletion does not cancel an active store subscription.",
  },
];

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <SectionHeading
        eyebrow="Support"
        title="Help for HeyYusuf."
        description="For product questions, account help, Premium support, or deletion requests, contact HeyLanguages."
      />

      <div className="mt-8 rounded-lg border border-line bg-panel/82 p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-semibold text-cream">Contact</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
          Email{" "}
          <a className="text-amber hover:text-cream" href={mailtoSupport()}>
            dev@heylanguages.com
          </a>{" "}
          with a short description of the issue. If the problem is in the app,
          include your device type, app version, and whether you were online or
          offline.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <SupportTopicCard key={topic.title} title={topic.title}>
            {topic.body}
          </SupportTopicCard>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Notice title="Restore Purchases">
          If Premium access is missing after purchase, open HeyYusuf and use
          Restore Purchases from the app. Make sure you are using the same Apple
          or Google account that made the purchase.
        </Notice>
        <Notice title="Subscription cancellation">
          Subscriptions must be cancelled through Apple App Store or Google Play.
          Deleting your HeyYusuf account does not cancel an active subscription.
        </Notice>
      </div>
    </main>
  );
}
