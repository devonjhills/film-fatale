import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Film Fatale handles account, usage, and device information.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="site-container max-w-4xl py-12 md:py-20">
      <article className="space-y-12">
        <header className="space-y-5 border-b border-border/75 pb-10">
          <p className="dossier-label">The fine print</p>
          <h1 className="page-title">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="legal-copy text-sm">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Information We Collect
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <strong>Account Information:</strong> When you create an
                account, we collect your email address and any profile
                information you provide.
              </p>
              <p className="text-muted-foreground">
                <strong>Usage Data:</strong> We collect information about how
                you use FilmFatale, including your watchlist, search queries,
                and browsing behavior.
              </p>
              <p className="text-muted-foreground">
                <strong>Device Information:</strong> We may collect information
                about your device, including IP address, browser type, and
                operating system.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. How We Use Your Information
            </h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                • To provide and maintain our service
              </p>
              <p className="text-muted-foreground">
                • To personalize your experience and provide content
                recommendations
              </p>
              <p className="text-muted-foreground">
                • To communicate with you about your account and our services
              </p>
              <p className="text-muted-foreground">
                • To improve our platform and develop new features
              </p>
              <p className="text-muted-foreground">
                • To comply with legal obligations
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Information Sharing
            </h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties without your consent, except as
              described in this policy. We may share information:
            </p>
            <div className="space-y-2 mt-2">
              <p className="text-muted-foreground">
                • With service providers who assist us in operating our platform
              </p>
              <p className="text-muted-foreground">
                • When required by law or to protect our rights and safety
              </p>
              <p className="text-muted-foreground">
                • In connection with a business transfer or acquisition
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your
              personal information. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Cookies and Tracking
            </h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your
              experience, analyze usage patterns, and provide personalized
              content. You can control cookie preferences through your browser
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Third-Party Services
            </h2>
            <p className="text-muted-foreground">
              Our platform integrates with third-party services, including The
              Movie Database (TMDB) for content data and authentication
              providers. These services have their own privacy policies that
              govern their use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <div className="space-y-2 mt-2">
              <p className="text-muted-foreground">
                • Access and update your personal information
              </p>
              <p className="text-muted-foreground">
                • Delete your account and associated data
              </p>
              <p className="text-muted-foreground">
                • Opt out of certain communications
              </p>
              <p className="text-muted-foreground">
                • Request a copy of your data
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground">
              FilmFatale is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. International Users
            </h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries
              other than your own. We take steps to ensure your data is
              protected regardless of where it is processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Changes to This Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us
              through our support channels or email us at
              privacy@filmfatale.app.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
