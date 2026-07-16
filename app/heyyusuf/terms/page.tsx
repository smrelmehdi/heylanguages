import { LegalLayout } from "@/components/LegalLayout";
import { createPageMetadata } from "@/lib/metadata";
import { mailtoSupport, siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "HeyYusuf Terms of Use",
  description:
    "Terms of Use for HeyYusuf, including accounts, learning content, subscriptions, acceptable use, and deletion.",
  path: siteConfig.routes.terms,
});

const toc = [
  { id: "acceptance", label: "Acceptance" },
  { id: "education", label: "Educational purpose" },
  { id: "accounts", label: "Accounts and guest use" },
  { id: "use", label: "Acceptable use" },
  { id: "content", label: "Content and IP" },
  { id: "premium", label: "Premium subscriptions" },
  { id: "deletion", label: "Deletion and cancellation" },
  { id: "availability", label: "Availability" },
  { id: "liability", label: "Disclaimers" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Use"
      intro="These Terms explain the rules for using HeyYusuf."
      toc={toc}
    >
      <h2 id="acceptance">Acceptance</h2>
      <p>
        By using HeyYusuf, you agree to these Terms. If you do not agree, do not
        use the app.
      </p>

      <h2 id="education">Educational purpose</h2>
      <p>
        HeyYusuf is an educational language-learning app. We work to make
        lessons useful and accurate, but we do not guarantee fluency, perfect
        translation, perfect pronunciation feedback, or that every phrase will
        fit every context.
      </p>

      <h2 id="accounts">Accounts and guest use</h2>
      <p>
        Some features may be available as a guest. Other features may require an
        account so we can save progress, manage access, or support Premium
        entitlement status.
      </p>
      <p>
        You are responsible for keeping your account access secure and for using
        accurate information where account details are requested.
      </p>

      <h2 id="use">Acceptable use</h2>
      <p>
        You may use HeyYusuf for personal learning. You may not misuse the app,
        interfere with the service, reverse engineer protected parts of the app,
        attempt unauthorized access, submit harmful content, or use the app in a
        way that violates applicable law.
      </p>

      <h2 id="content">Content and intellectual property</h2>
      <p>
        HeyLanguages owns or licenses the app, lessons, designs, audio, text,
        and related materials. You receive a limited, personal, non-transferable
        right to use HeyYusuf as provided through the app.
      </p>
      <p>
        If you submit voice recordings or other input for practice, you allow us
        to process that input to provide the requested learning feature.
      </p>

      <h2 id="premium">Premium subscriptions</h2>
      <p>
        Premium unlocks all currently available lessons and practice activities.
        Subscriptions are purchased through Apple App Store or Google Play and
        are managed by the store account used to buy them.
      </p>
      <p>
        Subscriptions may renew automatically unless cancelled through the
        relevant store before renewal. Refunds, cancellation, and billing issues
        are handled under Apple or Google policies. Restore Purchases is provided
        in the app where supported.
      </p>

      <h2 id="deletion">Deletion and cancellation</h2>
      <p>
        You can request account deletion through the{" "}
        <a href={siteConfig.routes.deleteAccount}>Delete Account</a> page.
        Deleting your HeyYusuf account does not cancel an active Apple App Store
        or Google Play subscription.
      </p>

      <h2 id="availability">Service changes and availability</h2>
      <p>
        We may change, pause, or remove features as the app evolves. We try to
        keep the service available, but we do not guarantee uninterrupted access.
        We may suspend or terminate access if these Terms are violated.
      </p>

      <h2 id="liability">Disclaimers and limitation of liability</h2>
      <p>
        HeyYusuf is provided as available. To the extent allowed by law,
        HeyLanguages disclaims warranties and is not liable for indirect,
        incidental, special, consequential, or punitive damages arising from use
        of the app.
      </p>
      <p>
        Third-party services, stores, and platforms may have their own terms and
        policies. Those services are responsible for their own systems.
      </p>

      <h2 id="contact">Changes, governing terms, and contact</h2>
      <p>
        We may update these Terms. Continued use after updates means you accept
        the updated Terms. These Terms are governed and interpreted in
        accordance with applicable laws. Any mandatory consumer protections
        available in your place of residence remain unaffected.
      </p>
      <p>
        Contact: <a href={mailtoSupport("HeyYusuf Terms")}>dev@heylanguages.com</a>
      </p>
    </LegalLayout>
  );
}
