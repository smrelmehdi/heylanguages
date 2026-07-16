import { LegalLayout } from "@/components/LegalLayout";
import { createPageMetadata } from "@/lib/metadata";
import { mailtoSupport, siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "HeyYusuf Privacy Policy",
  description:
    "Privacy policy for HeyYusuf, including account data, learning data, voice practice, subscriptions, and deletion.",
  path: siteConfig.routes.privacy,
});

const toc = [
  { id: "who-we-are", label: "Who we are" },
  { id: "information", label: "Information we collect" },
  { id: "voice", label: "Voice and pronunciation" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "use", label: "How we use information" },
  { id: "providers", label: "Service providers" },
  { id: "retention", label: "Retention and deletion" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This Privacy Policy explains how HeyLanguages handles information for HeyYusuf."
      toc={toc}
    >
      <h2 id="who-we-are">Who we are</h2>
      <p>
        HeyYusuf is a product of HeyLanguages. You can contact us at{" "}
        <a href={mailtoSupport("HeyYusuf Privacy")}>dev@heylanguages.com</a>.
      </p>

      <h2 id="information">Information we collect</h2>
      <p>
        We may collect account information you provide, such as your email
        address or profile details, if you create or sign into an account.
      </p>
      <p>
        We collect learning information needed to run the app, such as selected
        dialect, lesson progress, quiz progress, XP, saved practice state, and
        settings.
      </p>
      <p>
        We may collect technical information such as device type, operating
        system, app version, crash or diagnostic information, and network state
        needed to keep the service working.
      </p>

      <h2 id="voice">Voice and pronunciation data</h2>
      <p>
        If you use speaking or pronunciation features, voice recordings you
        submit may be transmitted to speech or AI-processing providers so the
        app can evaluate pronunciation and return feedback. We do not use voice
        recordings for advertising. Microphone permission is required only when
        you choose to use voice features.
      </p>
      <p>
        Do not submit sensitive personal information through voice practice.
      </p>

      <h2 id="subscriptions">Subscriptions and payments</h2>
      <p>
        Premium subscriptions are purchased through Apple App Store or Google
        Play where available. Store payment information is handled by Apple or
        Google, not by HeyLanguages.
      </p>
      <p>
        We use RevenueCat to help validate subscription status and manage
        Premium entitlement access inside the app.
      </p>

      <h2 id="use">How we use information</h2>
      <p>
        We use information to provide lessons, save progress, enable Premium
        access, respond to support requests, maintain security, fix bugs, and
        comply with legal obligations.
      </p>
      <p>
        Depending on where you live, our legal bases may include providing the
        service you requested, legitimate interests in operating and improving
        the app, consent where required, and compliance with law.
      </p>

      <h2 id="providers">Service providers</h2>
      <p>
        We rely on service providers to operate HeyYusuf, including Supabase for
        backend services, RevenueCat for subscription entitlement management,
        Apple and Google for store purchases, and speech, audio, or AI-processing
        providers where needed to deliver learning features.
      </p>
      <p>
        Providers may process information only as needed to provide their
        services to us and the app.
      </p>

      <h2 id="retention">Retention and deletion</h2>
      <p>
        We keep information only as long as reasonably needed to provide the app,
        meet legal obligations, resolve disputes, and maintain security.
      </p>
      <p>
        You can request account deletion from the{" "}
        <a href={siteConfig.routes.deleteAccount}>Delete Account</a> page.
        Deleting your HeyYusuf account does not cancel an active Apple App Store
        or Google Play subscription.
      </p>

      <h2 id="rights">Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct,
        delete, restrict, or object to certain processing of your personal
        information. Contact us to make a request.
      </p>
      <p>
        Information may be processed internationally by us or our providers.
        We use reasonable safeguards appropriate to the services involved.
      </p>

      <h2 id="children">Children</h2>
      <p>
        HeyYusuf is not intended for children under 13. If you believe a child
        under 13 provided personal information, contact us so we can review and
        remove it where appropriate.
      </p>

      <h2 id="contact">Changes and contact</h2>
      <p>
        We may update this policy as the app changes. The date at the top shows
        when it was last updated.
      </p>
      <p>
        Contact: <a href={mailtoSupport("HeyYusuf Privacy")}>dev@heylanguages.com</a>
      </p>
    </LegalLayout>
  );
}
