import type { Metadata } from 'next';
import Link from 'next/link';
import { WebShell } from '@/components/web/web-shell';

export const metadata: Metadata = {
  title: 'Terms of Service — Pullu',
  description: 'Terms governing use of the Pullu service.',
};

export default function TermsPage() {
  return (
    <WebShell>
      <div className="flex-1 bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: 11 April 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <p>
              Welcome to Pullu, a software service (the &quot;Service&quot;) operated by the entity providing Pullu
              (&quot;Pullu,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms and Conditions of
              Use (&quot;Terms&quot;) govern your use of our website, application, and related services that help you
              import, translate, and manage product listings for e-commerce stores (including integration with Shopify).
            </p>
            <p>
              By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use
              Pullu.
            </p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms and any policies incorporated
                by reference (including our Privacy Policy). If you do not agree to all of these terms, you must not use
                the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">2. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will provide notice by updating the &quot;Last updated&quot;
                date above. Your continued use of the Service after changes take effect constitutes acceptance of the
                revised Terms. If you do not agree, you must stop using the Service and may close your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">3. User Account</h2>
              <p>
                To use certain features, you must create an account. You agree to provide accurate, current, and
                complete information and to keep it updated. You are responsible for safeguarding your credentials and
                for all activity under your account. You must notify us promptly of any unauthorized use.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">4. Use of Service &amp; Your Responsibilities</h2>
              <p>
                Pullu is designed to help you import and manage product data (including from other stores or
                platforms) into your own store.{' '}
                <strong className="text-gray-900">
                  You represent and warrant that you have all rights, permissions, and authority necessary to import,
                  copy, list, translate, and otherwise use any products, images, text, and other content you process
                  through the Service
                </strong>
                — including rights from suppliers, brand owners, marketplaces, or other rights holders as applicable.
              </p>
              <p>
                You are solely responsible for ensuring that your use of the Service complies with the terms of any
                third-party platforms (including Shopify and source stores), applicable laws, and intellectual property
                rules. We do not verify that you hold such rights;{' '}
                <strong className="text-gray-900">
                  misuse of the Service to copy or list content you are not entitled to use is strictly prohibited
                </strong>
                .
              </p>
              <p>
                <strong className="text-gray-900">Your liability for misuse.</strong> You are solely responsible and
                legally liable for how you use the Service, including any products, listings, images, or other content
                you import, copy, translate, or publish through it. Pullu does not supervise, monitor, or approve each
                use of the Service and <strong className="text-gray-900">is not responsible</strong> if you misuse the
                Service for unlawful purposes, to infringe or violate anyone&apos;s intellectual property, contractual,
                or other rights (including usage or licensing rights), or for any other illegal or unauthorized
                activity. <strong className="text-gray-900">You agree that you bear full responsibility</strong> for
                your actions and content, and that <strong className="text-gray-900">Pullu shall not be liable</strong>{' '}
                for claims, fines, penalties, losses, or damages arising from such misuse or from your violation of
                third-party rights, laws, or platform terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">5. Restrictions</h2>
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>use the Service for any unlawful purpose or in violation of any applicable law or regulation;</li>
                <li>
                  use the Service to infringe or misappropriate intellectual property, privacy, or other rights of any
                  person;
                </li>
                <li>
                  attempt to gain unauthorized access to the Service, other accounts, or connected systems, or interfere
                  with the integrity or performance of the Service;
                </li>
                <li>reverse engineer, decompile, or attempt to extract source code except where prohibited by law;</li>
                <li>
                  use automated means to access the Service in a manner that imposes an unreasonable load or bypasses
                  rate limits or security measures.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">6. Intellectual Property</h2>
              <p>
                The Service, including its software, design, text, graphics, and branding (excluding your content and
                third-party content you import), is owned by Pullu or our licensors and is protected by intellectual
                property laws. We grant you a limited, non-exclusive, non-transferable license to use the Service in
                accordance with these Terms. No rights are granted except as expressly stated.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">7. Third-Party Services</h2>
              <p>
                The Service may integrate with or link to third-party services (for example Shopify, hosting, or AI
                providers). Those services are governed by their own terms and privacy policies. We are not responsible
                for third-party content, availability, or practices.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">8. Termination &amp; Suspension</h2>
              <p>
                <strong className="text-gray-900">
                  We may suspend or terminate your account or access to the Service at any time, with or without prior
                  notice, for any reason or no reason
                </strong>
                , including if we believe you have violated these Terms, pose a risk to the Service or other users, or as
                required by law. You may stop using the Service and request deletion of your account at any time (subject
                to our Privacy Policy and technical retention limits).
              </p>
              <p>
                Upon termination, your right to use the Service ceases. Provisions that by their nature should survive
                (including ownership, disclaimers, limitation of liability, and governing law) will survive.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                ERROR-FREE, OR THAT RESULTS FROM IMPORTS OR AI FEATURES WILL BE ACCURATE OR SUITABLE FOR YOUR BUSINESS.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PULLU AND ITS AFFILIATES, OFFICERS, AND EMPLOYEES SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
                DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT
                OF OR RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE
                SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US$100), IF YOU HAVE
                NOT PAID FEES.
              </p>
              <p>
                <strong className="text-gray-900">No liability for your misuse or unlawful conduct.</strong> Without
                limiting the foregoing, Pullu has <strong className="text-gray-900">no liability</strong> for any
                claim, loss, fine, or damage arising out of or relating to (i) your use of the Service in violation of
                these Terms, any law, or any third-party rights (including infringement or misuse of intellectual
                property or breach of usage, license, or platform terms), (ii) content or products you import or list
                without proper rights, or (iii) any illegal, fraudulent, or unauthorized use of the Service attributable
                to you or your account. <strong className="text-gray-900">You remain solely liable</strong> to third
                parties and authorities for such matters.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the United States and the State of Delaware, excluding conflict
                of law rules, except where mandatory consumer protection laws of your country of residence apply.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">12. Changes to the Service</h2>
              <p>
                We may modify, suspend, or discontinue the Service (or any part of it) at any time, with or without
                notice. We are not liable to you or any third party for any change, suspension, or discontinuation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900">13. Contact</h2>
              <p>
                For questions about these Terms, contact us at{' '}
                <a
                  href="mailto:support@pullu.app"
                  className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
                >
                  support@pullu.app
                </a>
                .
              </p>
            </section>

            <p className="text-gray-600 pt-4 border-t border-gray-200">
              By using Pullu, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
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
