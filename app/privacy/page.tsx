import type { Metadata } from 'next';
import Link from 'next/link';
import { WebShell } from '@/components/web/web-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy — Pullu',
  description: 'How Pullu collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <WebShell>
      <div className="flex-1 bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: 11 April 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <p>
              Pullu (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Pullu website and application (the
              &quot;Service&quot;). This Privacy Policy describes how we collect, use, disclose, and safeguard personal
              information when you use the Service, and your rights and choices.
            </p>
            <p>
              By using the Service, you agree to this Privacy Policy. If you do not agree, please do not use Pullu.
            </p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">1. Information we collect</h2>
              <p className="font-medium text-gray-900">Account &amp; authentication</p>
              <p>
                When you sign up or sign in (for example via email magic link or Google), we process identifiers such as
                your email address, authentication tokens, and profile information provided by the sign-in provider.
              </p>
              <p className="font-medium text-gray-900">Usage &amp; technical data</p>
              <p>
                We automatically collect certain technical information, such as device type, browser, approximate
                location derived from IP address, log data, and cookies or similar technologies needed to operate and
                secure the Service.
              </p>
              <p className="font-medium text-gray-900">Content &amp; store data</p>
              <p>
                To provide imports, translations, and Shopify integration, we process URLs, product data, and related
                content that you submit or that we retrieve on your behalf, as well as data necessary to connect your
                Shopify store (for example store identifiers and access tokens as configured in your account).
              </p>
              <p className="font-medium text-gray-900">Communications</p>
              <p>
                If you contact us (for example at support@pullu.app), we retain your message and contact details to
                respond and improve support.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">2. How we use information</h2>
              <p>We use personal information to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>provide, maintain, and improve the Service;</li>
                <li>authenticate users and protect accounts and the Service;</li>
                <li>process imports, AI-assisted features, and Shopify connections you request;</li>
                <li>communicate with you about the Service, security, or policy changes;</li>
                <li>comply with law and enforce our Terms of Service;</li>
                <li>analyze usage in aggregate to understand performance and usage trends.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">3. Legal bases (EEA, UK, Switzerland)</h2>
              <p>
                Where applicable, we rely on: performance of a contract with you; our legitimate interests in operating
                and securing the Service (balanced against your rights); consent where required (for example certain
                cookies or marketing, if offered); and legal obligations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">4. Sharing &amp; subprocessors</h2>
              <p>
                We use trusted service providers to host the Service, authenticate users, store data, and provide
                infrastructure (for example cloud hosting and database providers). They may process personal data only
                on our instructions and subject to appropriate safeguards.
              </p>
              <p>
                We may disclose information if required by law, to protect rights and safety, or in connection with a
                merger, acquisition, or sale of assets, subject to standard confidentiality arrangements.
              </p>
              <p>We do not sell your personal information as commonly understood in U.S. state privacy laws.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">5. Retention</h2>
              <p>
                We retain personal information for as long as your account is active or as needed to provide the Service,
                comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of
                your account subject to legal exceptions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">6. Security</h2>
              <p>
                We implement technical and organizational measures designed to protect personal information against
                unauthorized access, loss, or alteration. No method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">7. International transfers</h2>
              <p>
                If you access the Service from outside the country where our servers or providers are located, your
                information may be transferred to and processed in other countries. Where required, we use appropriate
                safeguards (such as standard contractual clauses).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">8. Your rights &amp; choices</h2>
              <p>
                Depending on your location, you may have rights to access, correct, delete, or export your personal
                information, object to or restrict certain processing, or withdraw consent where processing is
                consent-based. You may also have the right to lodge a complaint with a supervisory authority.
              </p>
              <p>
                To exercise these rights, contact us at{' '}
                <a
                  href="mailto:support@pullu.app"
                  className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
                >
                  support@pullu.app
                </a>
                . We may need to verify your request.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">9. Children</h2>
              <p>
                The Service is not directed to children under 16 (or the age required in your jurisdiction). We do not
                knowingly collect personal information from children. If you believe we have, contact us and we will
                delete it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">10. Cookies</h2>
              <p>
                We and our providers may use cookies and similar technologies for authentication, preferences, security,
                and analytics. You can control cookies through your browser settings; blocking essential cookies may
                affect Service functionality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">11. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will post the revised policy and update the
                &quot;Last updated&quot; date. Material changes may be communicated through the Service or by email where
                appropriate.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">12. Contact</h2>
              <p>
                Questions about this Privacy Policy:{' '}
                <a
                  href="mailto:support@pullu.app"
                  className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
                >
                  support@pullu.app
                </a>
              </p>
            </section>
          </div>

          <p className="mt-10">
            <Link href="/" className="text-sm font-medium text-gray-900 underline underline-offset-2">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </WebShell>
  );
}
