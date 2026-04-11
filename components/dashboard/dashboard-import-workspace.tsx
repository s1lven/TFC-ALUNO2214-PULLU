'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ImportMode = 'product' | 'collection' | null

type Props = {
  importMode: ImportMode
  onImportModeChange: (mode: ImportMode) => void
  selectedStoreReady: boolean
  showPendingOAuthHint: boolean
  url: string
  onUrlChange: (v: string) => void
  loading: boolean
  onScrapeProduct: () => void
  collectionUrl: string
  onCollectionUrlChange: (v: string) => void
  loadingCollection: boolean
  onScrapeCollection: () => void
}

export function DashboardImportWorkspace({
  importMode,
  onImportModeChange,
  selectedStoreReady,
  showPendingOAuthHint,
  url,
  onUrlChange,
  loading,
  onScrapeProduct,
  collectionUrl,
  onCollectionUrlChange,
  loadingCollection,
  onScrapeCollection,
}: Props) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      {!importMode && (
        <div className="flex flex-col gap-4 max-w-xl w-full">
          {showPendingOAuthHint && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Finish authorizing this store in Shopify (you should have been redirected after clicking Save &amp; connect), then import will work.
            </p>
          )}
          <button
            type="button"
            disabled={!selectedStoreReady}
            onClick={() => selectedStoreReady && onImportModeChange('product')}
            className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 transition-all hover:shadow-lg group disabled:opacity-50 disabled:pointer-events-none disabled:hover:border-gray-200"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Product Import</h3>
                <p className="text-sm text-gray-600">Import specific products</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={!selectedStoreReady}
            onClick={() => selectedStoreReady && onImportModeChange('collection')}
            className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 transition-all hover:shadow-lg group disabled:opacity-50 disabled:pointer-events-none disabled:hover:border-gray-200"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Collection import</h3>
                <p className="text-sm text-gray-600">Import all products from a collection</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {importMode === 'product' && (
        <div className="max-w-4xl mx-auto space-y-4 w-full">
          <button
            type="button"
            onClick={() => onImportModeChange(null)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to selection
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product URL</label>
            <p className="text-xs text-gray-500 mb-3">
              Example: <span className="font-mono">https://your-store.myshopify.com/products/product-name</span>
            </p>
            <Input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://store.com/products/example"
              className="h-12 text-base text-gray-900 border border-green-500 focus-visible:border-green-600"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onScrapeProduct}
              disabled={loading || !url}
              className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 shadow-lg text-base font-medium"
            >
              {loading ? 'Importing...' : 'Import Product'}
            </Button>
          </div>
        </div>
      )}

      {importMode === 'collection' && (
        <div className="max-w-4xl mx-auto space-y-4 w-full">
          <button
            type="button"
            onClick={() => onImportModeChange(null)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to selection
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collection URL</label>
            <p className="text-xs text-gray-500 mb-3">
              Example: <span className="font-mono">https://your-store.myshopify.com/collections/collection-name</span>
            </p>
            <Input
              type="url"
              value={collectionUrl}
              onChange={(e) => onCollectionUrlChange(e.target.value)}
              placeholder="https://store.com/collections/example"
              className="h-12 text-base text-gray-900 border border-green-500 focus-visible:border-green-600"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onScrapeCollection}
              disabled={loadingCollection || !collectionUrl}
              className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 shadow-lg text-base font-medium"
            >
              {loadingCollection ? 'Loading...' : 'Load Collection'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
