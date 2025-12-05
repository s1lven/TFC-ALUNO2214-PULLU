'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/dashboard/product-listing">
          <Button
            variant="ghost"
            className="text-neutral-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <Image src="/shopify.png" alt="Shopify" width={48} height={48} className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            How to Connect Your Shopify Store
          </h1>
          <p className="text-neutral-400 text-lg">
            Follow these simple steps to get your store credentials
          </p>
        </div>

        {/* Guide Content */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">1</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Get Your Store URL
                </h2>
                <p className="text-neutral-300 mb-3">
                  Your store URL is the domain you use to access your Shopify admin. It follows this format:
                </p>
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mb-3">
                  <code className="text-green-400 text-sm">
                    your-store-name.myshopify.com
                  </code>
                </div>
                <p className="text-neutral-400 text-sm">
                  💡 You can find this in your browser's address bar when you're logged into your Shopify admin.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">2</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Create a Custom App
                </h2>
                <ol className="space-y-3 text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Log in to your Shopify admin panel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Go to <strong className="text-white">Settings</strong> (bottom left)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click on <strong className="text-white">Apps and sales channels</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click <strong className="text-white">Develop apps</strong> at the top</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click <strong className="text-white">Create an app</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Give it a name (e.g., "Product Importer")</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">3</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Configure API Scopes
                </h2>
                <p className="text-neutral-300 mb-3">
                  After creating the app, you need to configure its permissions:
                </p>
                <ol className="space-y-3 text-neutral-300 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click on <strong className="text-white">Configure Admin API scopes</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Select these permissions:</span>
                  </li>
                </ol>
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <code className="text-sm text-neutral-300">read_products</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <code className="text-sm text-neutral-300">write_products</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <code className="text-sm text-neutral-300">read_product_listings</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <code className="text-sm text-neutral-300">write_product_listings</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <code className="text-sm text-neutral-300">read_publications</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <code className="text-sm text-neutral-300">write_publications</code>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm mt-3">
                  💡 These permissions allow the app to read and create products in your store.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">4</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Install the App & Get Access Token
                </h2>
                <ol className="space-y-3 text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click <strong className="text-white">Save</strong> on the configuration page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Go to the <strong className="text-white">API credentials</strong> tab</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click <strong className="text-white">Install app</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>After installation, you'll see the <strong className="text-white">Admin API access token</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Click <strong className="text-white">Reveal token once</strong> and copy it</span>
                  </li>
                </ol>
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mt-4">
                  <p className="text-amber-400 text-sm flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>
                      <strong>Important:</strong> Save this token somewhere safe! Shopify will only show it once. If you lose it, you'll need to generate a new one.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">5</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Connect Your Store
                </h2>
                <p className="text-neutral-300 mb-4">
                  Now you have everything you need! Go back to the dashboard and enter:
                </p>
                <div className="space-y-3">
                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                    <p className="text-neutral-400 text-sm mb-1">Store URL</p>
                    <code className="text-green-400 text-sm">your-store-name.myshopify.com</code>
                  </div>
                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                    <p className="text-neutral-400 text-sm mb-1">Access Token</p>
                    <code className="text-green-400 text-sm">shpat_xxxxxxxxxxxxxxxxxxxx</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Need More Help?</h3>
                <p className="text-neutral-300 mb-4">
                  If you're having trouble, check out Shopify's official documentation or contact our support team.
                </p>
                <a
                  href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  Shopify Documentation
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Back to Dashboard Button */}
          <div className="text-center pt-4">
            <Link href="/dashboard/product-listing">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 h-12 text-base font-medium shadow-lg shadow-green-600/20">
                Go Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

