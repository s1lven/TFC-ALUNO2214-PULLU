'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import ProductImport from './product-import';
import CollectionImport from './collection-import';

export default function ProductListingPage() {
  // Store management
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreUrl, setNewStoreUrl] = useState('');
  const [newStoreToken, setNewStoreToken] = useState('');
  const [addingStore, setAddingStore] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  
  const [url, setUrl] = useState('');
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Collection import states
  const [collectionUrl, setCollectionUrl] = useState('');
  const [collectionData, setCollectionData] = useState<any>(null);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [importingCollection, setImportingCollection] = useState(false);
  const [collectionImportStatus, setCollectionImportStatus] = useState<{ type: 'success' | 'error', message: string, collectionId?: string } | null>(null);
  
  // Editable fields
  const [editableTitle, setEditableTitle] = useState('');
  const [editableHandle, setEditableHandle] = useState('');
  const [editablePrice, setEditablePrice] = useState('');
  const [editableComparePrice, setEditableComparePrice] = useState('');
  const [editableDescriptionHtml, setEditableDescriptionHtml] = useState('');
  const [editableOptions, setEditableOptions] = useState<any[]>([]);
  const [editableVariants, setEditableVariants] = useState<any[]>([]);
  const [addingToStore, setAddingToStore] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [languageSearch, setLanguageSearch] = useState('');
  const [isTaxable, setIsTaxable] = useState(false);
  const [trackStock, setTrackStock] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [translationStatus, setTranslationStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [importStatus, setImportStatus] = useState<{ 
    type: 'success' | 'error', 
    message: string,
    productId?: string,
    productHandle?: string,
    storeUrl?: string,
    adminUrl?: string
  } | null>(null);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const response = await fetch('/api/get-stores');
        if (response.ok) {
          const data = await response.json();
          setStores(data.stores || []);
          if (data.stores && data.stores.length > 0) {
            setSelectedStore(data.stores[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/get-collections');
        if (response.ok) {
          const data = await response.json();
          setCollections(data.collections || []);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };

    fetchCollections();
  }, []);

  const addStore = async () => {
    if (!newStoreUrl || !newStoreToken) {
      setStoreError('Please provide both store URL and access token');
      return;
    }
    
    setAddingStore(true);
    setStoreError(null);
    
    try {
      const response = await fetch('/api/add-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopify_store_url: newStoreUrl, shopify_token: newStoreToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add store');
      }

      const result = await response.json();
      setStores([...stores, result.store]);
      setSelectedStore(result.store);
      setShowAddStoreModal(false);
      setNewStoreUrl('');
      setNewStoreToken('');
    } catch (err) {
      setStoreError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAddingStore(false);
    }
  };

  const scrapeProduct = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape product');
      }

      const data = await response.json();
      setProductData(data);
      
      // Populate editable fields
      setEditableTitle(data.title || '');
      setEditableHandle(data.handle || '');
      setEditablePrice(data.variants?.[0]?.price || '');
      setEditableComparePrice(data.variants?.[0]?.compare_at_price || '');
      setEditableDescriptionHtml(data.body_html || '');
      setEditableOptions(data.options || []);
      setEditableVariants(data.variants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const scrapeCollection = async () => {
    if (!collectionUrl) return;
    
    setLoadingCollection(true);
    setCollectionError(null);
    
    try {
      const response = await fetch('/api/scrape-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: collectionUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape collection');
      }

      const data = await response.json();
      setCollectionData(data);
    } catch (err) {
      setCollectionError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingCollection(false);
    }
  };

  return (
    <div className="min-h-full p-8" style={{ backgroundColor: '#F1F5F2' }}>
      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {/* Collection Import Status Toast */}
        {collectionImportStatus && (
          <div className="animate-slideUp">
            <div className={`${
              collectionImportStatus.type === 'success' 
                ? 'bg-green-500/90 border-green-400' 
                : 'bg-red-500/90 border-red-400'
            } backdrop-blur-sm border rounded-lg p-4 shadow-xl max-w-md`}>
              <div className="flex items-center gap-3">
                {collectionImportStatus.type === 'success' ? (
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className="text-white font-medium text-sm">{collectionImportStatus.message}</p>
                <button 
                  onClick={() => setCollectionImportStatus(null)}
                  className="ml-auto text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Translation Status Toast */}
        {translationStatus && (
          <div className="animate-slideUp">
            <div className={`${
              translationStatus.type === 'success' 
                ? 'bg-green-500/90 border-green-400' 
                : 'bg-red-500/90 border-red-400'
            } backdrop-blur-sm border rounded-lg p-4 shadow-xl max-w-md`}>
              <div className="flex items-center gap-3">
                {translationStatus.type === 'success' ? (
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className="text-white font-medium text-sm">{translationStatus.message}</p>
                <button 
                  onClick={() => setTranslationStatus(null)}
                  className="ml-auto text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Status Toast */}
        {importStatus && (
          <div className="animate-slideUp">
          <div className={`${
            importStatus.type === 'success' 
              ? 'bg-green-500/90 border-green-400' 
              : 'bg-red-500/90 border-red-400'
          } backdrop-blur-sm border rounded-lg p-4 shadow-xl max-w-md`}>
            <div className="flex items-start gap-3">
              {importStatus.type === 'success' ? (
                <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div className="flex-1">
                <p className="text-white font-medium text-sm mb-2">{importStatus.message}</p>
                {importStatus.type === 'success' && importStatus.storeUrl && importStatus.adminUrl && (
                  <div className="flex flex-col gap-2">
                    <a 
                      href={importStatus.storeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-white hover:text-green-100 underline"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View in Store
                    </a>
                    <a 
                      href={importStatus.adminUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-white hover:text-green-100 underline"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit on Shopify
                    </a>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setImportStatus(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto">
      {/* Store Selector - Hidden when product is loaded */}
      {!loadingStores && stores.length > 0 && !productData && !collectionData && (
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2.5 text-sm transition-colors">
                <Image src="/shopify.png" alt="Shopify" width={18} height={18} />
                <span className="font-medium text-green-700">
                  {selectedStore?.store_name || selectedStore?.shopify_store_url.replace('.myshopify.com', '')}
                </span>
                <svg className="w-4 h-4 text-green-700 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200 min-w-[240px]">
              {stores.map((store) => (
                <DropdownMenuItem key={store.id} onClick={() => setSelectedStore(store)}
                                 className={`text-gray-900 hover:bg-gray-50 cursor-pointer py-2 ${
                                   selectedStore?.id === store.id ? 'bg-gray-100' : ''
                                 }`}>
                  <div className="flex items-center gap-2 w-full">
                    <Image src="/shopify.png" alt="Shopify" width={16} height={16} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">
                        {store.store_name || store.shopify_store_url.replace('.myshopify.com', '')}
          </div>
                      <div className="text-[10px] text-gray-500 truncate">{store.shopify_store_url}</div>
            </div>
                    {selectedStore?.id === store.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                    )}
          </div>
                </DropdownMenuItem>
              ))}
              <div className="border-t border-gray-200 my-1"></div>
              <DropdownMenuItem onClick={() => setShowAddStoreModal(true)} className="text-gray-900 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3 w-full py-2 justify-center">
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Add Store</span>
            </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      )}

        {/* No Stores - Setup UI */}
        {!loadingStores && stores.length === 0 ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="max-w-2xl w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
                <div className="mb-8 flex justify-center">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <Image src="/shopify.png" alt="Shopify" width={40} height={40} className="object-contain" />
                </div>
                      </div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Connect Your Shopify Store</h2>
                  <p className="text-gray-600 text-lg">Start importing and managing products</p>
                      </div>
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2.5 block text-left">Store URL</label>
                    <Input value={newStoreUrl} onChange={(e) => setNewStoreUrl(e.target.value)}
                           placeholder="your-store.myshopify.com"
                           className="bg-white border-gray-300 text-gray-900 h-12 text-base" />
                      </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2.5 block text-left">Access Token</label>
                    <Input value={newStoreToken} onChange={(e) => setNewStoreToken(e.target.value)}
                           placeholder="shpat_..." type="password"
                           className="bg-white border-gray-300 text-gray-900 h-12 text-base" />
                    </div>
                  {storeError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{storeError}</p>
                            </div>
                          )}
                  <Button onClick={addStore} disabled={addingStore || !newStoreUrl || !newStoreToken}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-12 text-base font-medium">
                    {addingStore ? 'Connecting...' : 'Connect Store'}
                  </Button>
                        </div>
                <div className="text-center pt-6 border-t border-gray-200">
                  <a href="/guide" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                    Need help? Learn how to get your access token →
                  </a>
                          </div>
                        </div>
                  </div>
                </div>
              ) : (
          <>
      {/* Header with Import - Hidden when product or collection is loaded */}
      {!productData && !collectionData && (
        <div className="mb-6 space-y-4">
          
          {/* Product Import Input */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-3">Import Product</h3>
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://store.com/products/example"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:ring-offset-0 focus-visible:border-purple-500"
              />
              <Button 
                onClick={scrapeProduct} 
                disabled={loading || !url}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 h-10 shadow-lg shadow-blue-600/20"
              >
                {loading ? 'Importing...' : 'Import Product'}
              </Button>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Collection Import Input */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-3">Import Collection</h3>
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://store.com/collections/example"
                value={collectionUrl}
                onChange={(e) => setCollectionUrl(e.target.value)}
                className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-10 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:ring-offset-0 focus-visible:border-green-500"
              />
              <Button 
                onClick={scrapeCollection} 
                disabled={loadingCollection || !collectionUrl}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 h-10 shadow-lg shadow-green-600/20"
              >
                {loadingCollection ? 'Loading...' : 'Load Collection'}
              </Button>
            </div>
            {collectionError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{collectionError}</p>
              </div>
            )}
          </div>
        </div>
      )}
                    
      {/* Collection Data Display */}
      {collectionData && (
        <CollectionImport
          collectionData={collectionData}
          selectedStore={selectedStore}
          importingCollection={importingCollection}
          setImportingCollection={setImportingCollection}
          setCollectionImportStatus={setCollectionImportStatus}
          setCollectionData={setCollectionData}
          setCollectionUrl={setCollectionUrl}
        />
      )}

      {/* Product Import Section */}
      {productData && (
        <ProductImport
          productData={productData}
          editableTitle={editableTitle}
          setEditableTitle={setEditableTitle}
          editableHandle={editableHandle}
          setEditableHandle={setEditableHandle}
          editablePrice={editablePrice}
          setEditablePrice={setEditablePrice}
          editableComparePrice={editableComparePrice}
          setEditableComparePrice={setEditableComparePrice}
          editableDescriptionHtml={editableDescriptionHtml}
          setEditableDescriptionHtml={setEditableDescriptionHtml}
          editableOptions={editableOptions}
          setEditableOptions={setEditableOptions}
          editableVariants={editableVariants}
          setEditableVariants={setEditableVariants}
          selectedStore={selectedStore}
          collections={collections}
          isTaxable={isTaxable}
          setIsTaxable={setIsTaxable}
          trackStock={trackStock}
          setTrackStock={setTrackStock}
          selectedCollections={selectedCollections}
          setSelectedCollections={setSelectedCollections}
          addingToStore={addingToStore}
          setAddingToStore={setAddingToStore}
          translating={translating}
          setTranslating={setTranslating}
          setImportStatus={setImportStatus}
          setTranslationStatus={setTranslationStatus}
          languageSearch={languageSearch}
          setLanguageSearch={setLanguageSearch}
        />
      )}
      </>
      )}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-gray-900 text-lg font-semibold mb-6">Add Shopify Store</h3>
                      <div className="space-y-5">
                        <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Store URL</label>
                <Input value={newStoreUrl} onChange={(e) => setNewStoreUrl(e.target.value)}
                       placeholder="your-store.myshopify.com"
                                 className="bg-white border-gray-300 text-gray-900 h-11" />
                  </div>
                        <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Access Token</label>
                <Input value={newStoreToken} onChange={(e) => setNewStoreToken(e.target.value)}
                       placeholder="shpat_..." type="password"
                                 className="bg-white border-gray-300 text-gray-900 h-11" />
                </div>
              {storeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{storeError}</p>
              </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => { setShowAddStoreModal(false); setNewStoreUrl(''); setNewStoreToken(''); setStoreError(null); }}
                        variant="outline" className="flex-1 bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button onClick={addStore} disabled={addingStore || !newStoreUrl || !newStoreToken}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                  {addingStore ? 'Adding...' : 'Add Store'}
                </Button>
                          </div>
                </div>
              </div>
          </div>
      )}
      </div>
    </div>
  );
}
