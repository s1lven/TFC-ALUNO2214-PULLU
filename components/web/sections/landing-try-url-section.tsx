'use client'

import { HugeiconsIcon } from '@hugeicons/react';
import { LinkFreeIcons } from '@hugeicons/core-free-icons';

export function LandingTryUrlSection() {
  return (
    <div className="w-full py-16 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Try it now
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Paste any product URL from Shopify, Temu, or AliExpress to see the magic
          </p>
        </div>

        <div className="relative flex items-center bg-white rounded-xl shadow-xl border border-gray-200">
          <HugeiconsIcon icon={LinkFreeIcons} size={20} className="absolute left-4 text-gray-900 pointer-events-none" aria-hidden />
          <input
            type="url"
            placeholder="https://www.aliexpress.com/item/..."
            className="w-full pl-12 pr-32 py-4 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 rounded-xl"
          />
          <button 
            type="button"
            onClick={() => { window.location.href = '/dashboard' }}
            className="absolute right-2 top-2 bottom-2 px-6 bg-brand hover:bg-brand-hover transition-all text-gray-900 font-semibold rounded-lg cursor-pointer"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  )
}
