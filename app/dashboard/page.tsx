'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import ProductImport from './product-import';
import CollectionImport from './collection-import';
import SubscriptionGate from '@/components/subscription-gate';
import type { ShopifyStore, Product, ProductOption, Collection } from '@/types';

export default function DashboardPage() {
  // Store management
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<ShopifyStore | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreUrl, setNewStoreUrl] = useState('');
  const [newStoreToken, setNewStoreToken] = useState('');
  const [addingStore, setAddingStore] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  
  const [url, setUrl] = useState('');
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Collection import states
  const [collectionUrl, setCollectionUrl] = useState('');
  const [collectionData, setCollectionData] = useState<{ products?: unknown[]; [key: string]: unknown } | null>(null);
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
  const [editableOptions, setEditableOptions] = useState<ProductOption[]>([]);
  const [editableVariants, setEditableVariants] = useState<Array<Record<string, unknown>>>([]);
  const [addingToStore, setAddingToStore] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [languageSearch, setLanguageSearch] = useState('');
  const [isTaxable, setIsTaxable] = useState(false);
  const [trackStock, setTrackStock] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
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
  const [importMode, setImportMode] = useState<'product' | 'collection' | null>(null);

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

  // Fetch collections when store is selected
  useEffect(() => {
    const fetchCollections = async () => {
      if (!selectedStore?.id) return;
      
      try {
        const response = await fetch('/api/get-collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storeId: selectedStore.id }),
        });
        if (response.ok) {
          const data = await response.json();
          setCollections(data.collections || []);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };

    fetchCollections();
  }, [selectedStore]);

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
    <SubscriptionGate>
    <div className="h-full overflow-hidden" style={{ backgroundColor: '#F1F5F2' }}>
      {/* Loading State */}
      {loadingStores ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <>
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
          <div className={`bg-white border rounded-lg p-4 shadow-lg max-w-md ${
            importStatus.type === 'success' ? 'border-gray-200' : 'border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {importStatus.type === 'success' ? (
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-sm mb-3">{importStatus.message}</p>
                {importStatus.type === 'success' && importStatus.storeUrl && importStatus.adminUrl && (
                  <div className="flex gap-2">
                    <a 
                      href={importStatus.storeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-xs font-medium transition-colors"
                    >
                      View in Store
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a 
                      href={importStatus.adminUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md text-xs font-medium transition-colors"
                    >
                      Edit on Shopify
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setImportStatus(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

      {/* Store Selector - Fixed at top left */}
      {stores.length > 0 && !productData && !collectionData && (
        <div className="fixed top-20 left-8 z-40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2.5 text-sm transition-colors shadow-sm">
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
                                 className={`cursor-pointer px-3 py-2 focus:bg-gray-50 hover:bg-gray-50 ${
                                   selectedStore?.id === store.id ? 'bg-gray-100' : ''
                                 }`}>
                  <div className="flex items-center gap-2.5 w-full">
                    <Image src="/shopify.png" alt="Shopify" width={16} height={16} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-gray-900 hover:text-gray-900">
                        {store.store_name || store.shopify_store_url.replace('.myshopify.com', '')}
          </div>
                      <div className="text-xs text-gray-500 truncate hover:text-gray-500">{store.shopify_store_url}</div>
            </div>
                    {selectedStore?.id === store.id && (
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    )}
          </div>
                </DropdownMenuItem>
              ))}
              <div className="border-t border-gray-200 my-1"></div>
              <DropdownMenuItem onClick={() => setShowAddStoreModal(true)} className="cursor-pointer px-3 py-2 focus:bg-gray-50 hover:bg-gray-50">
                <div className="flex items-center gap-2 w-full justify-center">
                  <Plus className="w-4 h-4 text-gray-900 hover:text-gray-900" />
                  <span className="font-medium text-sm text-gray-900 hover:text-gray-900">Add Store</span>
            </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      )}

      <div className={`mx-auto ${productData || collectionData ? 'h-full' : 'max-w-[1600px] p-8'}`}>

        {/* No Stores - Setup UI */}
        {stores.length === 0 ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-8">
            <div className="max-w-4xl w-full flex gap-8 items-start">
              {/* Left side - Main Form */}
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
                          className="w-full bg-[#4CF365] hover:bg-[#3de056] text-white h-12 text-base font-medium rounded-xl">
                    {addingStore ? 'Connecting...' : 'Connect Store'}
                  </Button>
                </div>
                <div className="text-center pt-6 border-t border-gray-200">
                  <a href="/guide" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CF365] transition-colors">
                    Need help? Learn how to get your access token →
                  </a>
                </div>
              </div>

              {/* Right side - Steps */}
              <div className="flex-shrink-0 w-56">
                <div className="space-y-0">
                  {/* Step 1 - Done */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <div className="w-px h-12 bg-gray-900 my-1.5"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Sign up</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Create your account</p>
                    </div>
                  </div>

                  {/* Step 2 - Done */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      <div className="w-px h-12 bg-gray-900 my-1.5"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Choose Plan</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Selected your subscription</p>
                    </div>
                  </div>

                  {/* Step 3 - Current */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 rounded-full border-2 border-gray-900 bg-white"></div>
                      <div className="w-px h-12 bg-gray-200 my-1.5"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Connect Store</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Link your Shopify store</p>
                    </div>
                  </div>

                  {/* Step 4 - Pending */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 rounded-full bg-gray-200"></div>
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
              ) : (
          <>
      {/* Header with Import - Hidden when product or collection is loaded */}
      {!productData && !collectionData && (
        <div className="flex items-center justify-center min-h-[60vh]">
          {/* Import Mode Selection */}
          {!importMode && (
            <div className="flex flex-col gap-4 max-w-xl w-full">
              {/* Product Import Card */}
              <button
                onClick={() => setImportMode('product')}
                className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 transition-all hover:shadow-lg group"
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

              {/* Collection Import Card */}
              <button
                onClick={() => setImportMode('collection')}
                className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 transition-all hover:shadow-lg group"
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

          {/* Product Import Mode */}
          {importMode === 'product' && (
            <div className="max-w-4xl mx-auto space-y-4 w-full">
              <button
                onClick={() => setImportMode(null)}
                className="text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                ← Back to selection
              </button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Example: <span className="font-mono">https://your-store.myshopify.com/products/product-name</span>
                </p>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://store.com/products/example"
                  className="h-12 text-base text-gray-900 border border-green-500 focus-visible:border-green-600"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={scrapeProduct} 
                  disabled={loading || !url}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 shadow-lg text-base font-medium"
                >
                  {loading ? 'Importing...' : 'Import Product'}
                </Button>
              </div>
            </div>
          )}

          {/* Collection Import Mode */}
          {importMode === 'collection' && (
            <div className="max-w-4xl mx-auto space-y-4 w-full">
              <button
                onClick={() => setImportMode(null)}
                className="text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                ← Back to selection
              </button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection URL
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Example: <span className="font-mono">https://your-store.myshopify.com/collections/collection-name</span>
                </p>
                <Input
                  type="url"
                  value={collectionUrl}
                  onChange={(e) => setCollectionUrl(e.target.value)}
                  placeholder="https://store.com/collections/example"
                  className="h-12 text-base text-gray-900 border border-green-500 focus-visible:border-green-600"
                />
              </div>

              {collectionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{collectionError}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={scrapeCollection} 
                  disabled={loadingCollection || !collectionUrl}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 shadow-lg text-base font-medium"
                >
                  {loadingCollection ? 'Loading...' : 'Load Collection'}
                </Button>
              </div>
            </div>
          )}
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
          onBack={() => {
            setProductData(null);
            setUrl('');
          }}
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
      </>
      )}
    </div>
    </SubscriptionGate>
  );
}
