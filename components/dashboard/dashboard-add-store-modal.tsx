'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  open: boolean
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
  onClose: () => void
}

export function DashboardAddStoreModal({
  open,
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
  onClose,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-gray-900 text-lg font-semibold">Add new store</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          How to connect your store — see the integration guide for screenshots and scopes.
        </p>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Store</label>
            <Input
              value={newStoreSubdomain}
              onChange={(e) => onSubdomainChange(e.target.value)}
              placeholder="your-store"
              className="bg-white border-gray-300 text-gray-900 h-11"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Alias</label>
            <Input
              value={newStoreAlias}
              onChange={(e) => onAliasChange(e.target.value)}
              placeholder="Label in Pullu"
              className="bg-white border-gray-300 text-gray-900 h-11"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Client ID</label>
            <Input
              value={newClientId}
              onChange={(e) => onClientIdChange(e.target.value)}
              placeholder="Dev Dashboard → app → Settings → Credentials"
              className="bg-white border-gray-300 text-gray-900 h-11"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Secret</label>
            <Input
              value={newClientSecret}
              onChange={(e) => onClientSecretChange(e.target.value)}
              type="password"
              className="bg-white border-gray-300 text-gray-900 h-11"
            />
          </div>
          {storeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{storeError}</p>
            </div>
          )}
          <div className="space-y-3 pt-2">
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
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
          <a
            href="/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-green-700 hover:underline"
          >
            Open integration guide
          </a>
        </div>
      </div>
    </div>
  )
}
