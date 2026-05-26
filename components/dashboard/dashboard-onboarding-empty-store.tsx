'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  newStoreSubdomain: string
  onSubdomainChange: (v: string) => void
  newStoreAlias: string
  onAliasChange: (v: string) => void
  newClientId: string
  onClientIdChange: (v: string) => void
  newClientSecret: string
  onClientSecretChange: (v: string) => void
  storeError: string | null
  addingStore: boolean
  onConnect: () => void
}

export function DashboardOnboardingEmptyStore({
  newStoreSubdomain,
  onSubdomainChange,
  newStoreAlias,
  onAliasChange,
  newClientId,
  onClientIdChange,
  newClientSecret,
  onClientSecretChange,
  storeError,
  addingStore,
  onConnect,
}: Props) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-8">
      <div className="max-w-4xl w-full flex gap-8 items-start">
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <Image src="/shopify.png" alt="Shopify" width={40} height={40} className="object-contain" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Connect Your Shopify Store</h2>
            <p className="text-gray-600 text-lg">Start importing and managing products</p>
          </div>
          <div className="space-y-5 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2.5 block text-left">Store Name</label>
              <Input
                value={newStoreAlias}
                onChange={(e) => onAliasChange(e.target.value)}
                placeholder="My Store"
                className="bg-white border-gray-300 text-gray-900 h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2.5 block text-left">Store URL</label>
              <Input
                value={newStoreSubdomain}
                onChange={(e) => onSubdomainChange(e.target.value)}
                placeholder="your-store.myshopify.com"
                className="bg-white border-gray-300 text-gray-900 h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2.5 block text-left">Client ID</label>
              <Input
                value={newClientId}
                onChange={(e) => onClientIdChange(e.target.value)}
                placeholder="From app Settings → Credentials"
                className="bg-white border-gray-300 text-gray-900 h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2.5 block text-left">Secret</label>
              <Input
                value={newClientSecret}
                onChange={(e) => onClientSecretChange(e.target.value)}
                type="password"
                placeholder="Client secret (admin API)"
                className="bg-white border-gray-300 text-gray-900 h-12 text-base"
              />
            </div>
            {storeError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{storeError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={onConnect}
                disabled={
                  addingStore ||
                  !newStoreSubdomain?.trim() ||
                  !newStoreAlias?.trim() ||
                  !newClientId?.trim() ||
                  !newClientSecret?.trim()
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-10 font-medium shadow-lg shadow-green-600/20"
              >
                {addingStore ? 'Redirecting…' : 'Save & connect'}
              </Button>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-gray-200">
            <a
              href="/guide"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors"
            >
              How to connect your store (custom app + OAuth) →
            </a>
          </div>
        </div>

        <div className="flex-shrink-0 w-56">
          <div className="space-y-0">
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <div className="w-px h-12 bg-gray-900 my-1.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Sign up</h4>
                <p className="text-xs text-gray-400 mt-0.5">Create your account</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <div className="w-px h-12 bg-gray-900 my-1.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Get started</h4>
                <p className="text-xs text-gray-400 mt-0.5">Signed in and ready</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full border-2 border-gray-900 bg-white" />
                <div className="w-px h-12 bg-gray-200 my-1.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Connect Store</h4>
                <p className="text-xs text-gray-400 mt-0.5">Link your Shopify store</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-400">Start Importing</h4>
                <p className="text-xs text-gray-300 mt-0.5">Import your first product</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
