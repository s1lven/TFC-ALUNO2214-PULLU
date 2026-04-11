import Link from 'next/link'
import { PulluMark } from '@/components/web/pullu-brand'

export function SiteFooter() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <PulluMark size={28} />
              <span className="text-xl font-bold text-gray-900">Pullu</span>
            </div>
            <p className="text-sm text-gray-600">
              Automate your product listings and save hours every day. Built for modern e-commerce.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Practical Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm">Login</a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Try now</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Contact Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@pullu.app" className="text-gray-600 hover:text-gray-900 text-sm">support@pullu.app</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-600">
            © 2026 Pullu, All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
