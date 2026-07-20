import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing the use of Film Fatale.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="site-container max-w-4xl py-12 md:py-20">
      <article className="space-y-12">
        <header className="space-y-5 border-b border-border/75 pb-10">
          <p className="dossier-label">The fine print</p>
          <h1 className="page-title">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="legal-copy text-sm">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing and using FilmFatale, you accept and agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground">
              FilmFatale is a movie and TV show discovery platform that provides
              information, ratings, and personal watchlist functionality. Our
              content is sourced from The Movie Database (TMDB).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                • You must be at least 13 years old to create an account
              </p>
              <p className="text-muted-foreground">
                • You are responsible for maintaining the security of your
                account
              </p>
              <p className="text-muted-foreground">
                • You must provide accurate and complete information when
                creating your account
              </p>
              <p className="text-muted-foreground">
                • You are responsible for all activities that occur under your
                account
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <div className="space-y-2 mt-2">
              <p className="text-muted-foreground">
                • Use the service for any unlawful purpose or in violation of
                any laws
              </p>
              <p className="text-muted-foreground">
                • Attempt to gain unauthorized access to our systems or other
                users&apos; accounts
              </p>
              <p className="text-muted-foreground">
                • Interfere with or disrupt the service or servers connected to
                the service
              </p>
              <p className="text-muted-foreground">
                • Create multiple accounts for malicious purposes
              </p>
              <p className="text-muted-foreground">
                • Use automated systems to access the service without permission
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
            <p className="text-muted-foreground">
              When you create watchlists or provide other content through our
              service:
            </p>
            <div className="space-y-2 mt-2">
              <p className="text-muted-foreground">
                • You retain ownership of your content
              </p>
              <p className="text-muted-foreground">
                • You grant us the right to use, store, and display your content
                as necessary to provide the service
              </p>
              <p className="text-muted-foreground">
                • You are responsible for the content you create and share
              </p>
              <p className="text-muted-foreground">
                • We may remove content that violates these terms
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Intellectual Property
            </h2>
            <p className="text-muted-foreground">
              The FilmFatale platform and its original content are owned by us
              and protected by intellectual property laws. Movie and TV show
              data is provided by TMDB and subject to their terms and
              conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Third-Party Services
            </h2>
            <p className="text-muted-foreground">
              Our service integrates with third-party services including TMDB
              and authentication providers. Your use of these services is
              subject to their respective terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground">
              FilmFatale is provided &quot;as is&quot; without any warranties,
              express or implied. We do not warrant that the service will be
              uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Privacy</h2>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account at any time for
              violations of these terms. You may delete your account at any time
              through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms of Service from time to time. We will
              notify you of any material changes by posting the updated terms on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by and construed in accordance with
              applicable laws. Any disputes will be resolved in the appropriate
              courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact
              us through our support channels or email us at
              legal@filmfatale.app.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
