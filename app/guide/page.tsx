import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { SHOPIFY_SCOPES_DOCUMENTATION } from '@/lib/shopify/scopes';

const SITE = 'https://pullu.app';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/dashboard"
          className="group mb-8 inline-flex items-center gap-2 rounded-lg py-2 pl-2 pr-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Dashboard
        </Link>

        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center justify-center rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <Image src="/shopify.png" alt="Shopify" width={44} height={44} className="object-contain" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Connect Shopify to Pullu</h1>
          <p className="mx-auto max-w-lg text-neutral-400">
            Create a custom app in Shopify, paste two values into Pullu, approve access once.
          </p>
        </div>

        <div className="space-y-6">
          <Section title="1. Create app in Shopify">
            <p className="text-neutral-300">
              In Shopify admin: <strong className="text-white">Settings</strong> →{' '}
              <strong className="text-white">Apps and sales channels</strong> →{' '}
              <strong className="text-white">Develop apps</strong> → open the Dev Dashboard →{' '}
              <strong className="text-white">Create app</strong>. Name it anything (e.g. Pullu).
            </p>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
              <p className="mb-2 text-sm font-medium text-white">App URL</p>
              <code className="break-all text-sm text-green-400">{SITE}/</code>
            </div>

            <div>
              <p className="mb-2 text-sm text-white">Admin API scopes — enable these, then release a new app version:</p>
              <div className="rounded-lg border border-neutral-700 bg-neutral-950 p-3">
                <code className="whitespace-pre-wrap break-all text-xs text-green-300">
                  {SHOPIFY_SCOPES_DOCUMENTATION}
                </code>
              </div>
            </div>

            <p className="text-neutral-300 text-sm">
              Open <strong className="text-white">Settings → Credentials</strong> and copy the{' '}
              <strong className="text-white">Client ID</strong> and{' '}
              <strong className="text-white">Client secret</strong>.
            </p>
          </Section>

          <Section title="2. Add store in Pullu">
            <p className="text-neutral-300">
              Go to{' '}
              <Link href="/dashboard" className="text-green-400 hover:text-green-300">
                {SITE}/dashboard
              </Link>
              , sign in, then <strong className="text-white">Add store</strong>. Enter your{' '}
              <code className="text-green-400">.myshopify.com</code> domain, an optional alias, and the Client ID
              and secret. Finish in Shopify; use the same browser for the whole flow.
            </p>
          </Section>

          <Section title="If something fails">
            <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-300">
              <li>
                <strong className="text-white">Credentials</strong> — Check ID and secret; app version must be released.
              </li>
              <li>
                <strong className="text-white">Scopes</strong> — Add every scope above, release again, reconnect.
              </li>
              <li>
                <strong className="text-white">Stuck</strong> — Remove the store in Pullu and add it again from step 2.
              </li>
            </ul>
          </Section>

          <a
            href="https://shopify.dev/docs/apps/auth/oauth"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-blue-700/30 bg-blue-900/20 p-4 text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            Shopify OAuth docs
            <ExternalLink className="h-4 w-4" />
          </a>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-4 text-sm">{children}</div>
    </div>
  );
}
