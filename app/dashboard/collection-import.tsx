'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Sparkles, CircleDollarSign, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { ShopifyStore } from '@/types';
import {
  adjustCollectionProductsPrices,
  currencySymbol,
  FRANKFURTER_CURRENCIES,
  type CollectionProductShape,
} from '@/lib/pricing/adjust-collection-prices';

type CollectionProduct = {
  title?: string;
  body_html?: string;
  options?: Array<{ name: string; values: string[] }>;
  images?: Array<{ src: string; alt?: string }>;
  variants?: Array<{ price: string; compare_at_price?: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

const languages = [
  { code: 'EN-US', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT-PT', name: 'Portuguese' },
  { code: 'NL', name: 'Dutch' },
  { code: 'PL', name: 'Polish' },
  { code: 'RU', name: 'Russian' },
  { code: 'JA', name: 'Japanese' },
  { code: 'ZH', name: 'Chinese' },
  { code: 'KO', name: 'Korean' },
  { code: 'SV', name: 'Swedish' },
  { code: 'DA', name: 'Danish' },
  { code: 'FI', name: 'Finnish' },
  { code: 'NO', name: 'Norwegian' },
  { code: 'CS', name: 'Czech' },
  { code: 'EL', name: 'Greek' },
  { code: 'HU', name: 'Hungarian' },
  { code: 'RO', name: 'Romanian' },
  { code: 'SK', name: 'Slovak' },
  { code: 'BG', name: 'Bulgarian' },
  { code: 'TR', name: 'Turkish' },
  { code: 'ID', name: 'Indonesian' },
  { code: 'UK', name: 'Ukrainian' },
];

export default function CollectionImport({
  collectionData,
  selectedStore,
  importingCollection,
  setImportingCollection,
  setCollectionImportStatus,
  setCollectionData,
  setCollectionUrl
}: { 
  collectionData: { products?: unknown[]; [key: string]: unknown }; 
  selectedStore: ShopifyStore | null;
  importingCollection: boolean;
  setImportingCollection: (value: boolean) => void;
  setCollectionImportStatus: (status: { type: 'success' | 'error'; message: string; collectionId?: string } | null) => void;
  setCollectionData: React.Dispatch<React.SetStateAction<{ products?: unknown[]; [key: string]: unknown } | null>>; 
  setCollectionUrl: (url: string) => void;
}) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>(
    (collectionData.products as unknown[])?.map((_, index: number) => index) || []
  );
  const [selectAll, setSelectAll] = useState(true);
  const [collections, setCollections] = useState<Array<{ id: string; title: string; [key: string]: unknown }>>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [collectionMode, setCollectionMode] = useState<'new' | 'existing'>('new');
  const [newCollectionName, setNewCollectionName] = useState<string>(
    (typeof collectionData.title === 'string' ? collectionData.title : '') || ''
  );
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, currentProduct: '' });
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [adjustPercentInput, setAdjustPercentInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [roundMode, setRoundMode] = useState<'none' | '0.95' | '0.90' | '0.99' | 'custom'>('none');
  const [customEndingInput, setCustomEndingInput] = useState('0.95');
  const [applyPricesToSelectedOnly, setApplyPricesToSelectedOnly] = useState(false);
  const [listCurrencyCode, setListCurrencyCode] = useState('USD');
  const [ratePreview, setRatePreview] = useState<{ rate: number; date: string | null } | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceAdjustLoading, setPriceAdjustLoading] = useState(false);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

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

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev: string[]) => 
      prev.includes(collectionId)
        ? prev.filter((id: string) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const selectedCollectionNames = selectedCollections.length === 0 
    ? 'No collection' 
    : selectedCollections.length === 1
    ? collections.find((c: { id: string; title: string }) => c.id.toString() === selectedCollections[0])?.title || 'No collection'
    : `${selectedCollections.length} collections selected`;

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts((collectionData.products as unknown[])?.map((_, index: number) => index) || []);
    }
    setSelectAll(!selectAll);
  };

  const toggleProduct = (index: number) => {
    if (selectedProducts.includes(index)) {
      const newSelected = selectedProducts.filter(i => i !== index);
      setSelectedProducts(newSelected);
      setSelectAll(newSelected.length === collectionData.products?.length);
    } else {
      const newSelected = [...selectedProducts, index];
      setSelectedProducts(newSelected);
      setSelectAll(newSelected.length === collectionData.products?.length);
    }
  };

  const applyPriceAdjustments = async () => {
    if (!collectionData?.products?.length) return;

    if (applyPricesToSelectedOnly && selectedProducts.length === 0) {
      setPriceError('Select at least one product, or turn off “selected only”.');
      return;
    }

    const adjustPercent = parseFloat(adjustPercentInput) || 0;
    const maxPrice =
      maxPriceInput.trim() === '' ? null : parseFloat(maxPriceInput);
    if (maxPrice != null && (!Number.isFinite(maxPrice) || maxPrice <= 0)) {
      setPriceError('Cap must be a positive number, or leave blank.');
      return;
    }

    let roundEnding: number | null = null;
    if (roundMode === 'custom') {
      const e = parseFloat(customEndingInput);
      if (!Number.isFinite(e) || e <= 0 || e >= 1) {
        setPriceError('Custom ending must be a decimal between 0 and 1 (e.g. 0.95).');
        return;
      }
      roundEnding = e;
    } else if (roundMode !== 'none') {
      roundEnding = parseFloat(roundMode);
    }

    setPriceAdjustLoading(true);
    setPriceError(null);

    try {
      let rate = 1;
      if (fromCurrency !== toCurrency) {
        const res = await fetch('/api/exchange-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromCurrency, to: toCurrency }),
        });
        const json = await res.json();
        if (!res.ok) {
          setPriceError(typeof json.error === 'string' ? json.error : 'Failed to load exchange rate');
          return;
        }
        rate = json.rate as number;
        setRatePreview({ rate: json.rate as number, date: json.date ?? null });
      } else {
        setRatePreview({ rate: 1, date: null });
      }

      const pipe = {
        exchangeRate: rate,
        adjustPercent,
        maxPrice,
        roundEnding,
      };

      const products = collectionData.products as CollectionProductShape[];
      const indices = applyPricesToSelectedOnly
        ? [...selectedProducts].sort((a, b) => a - b)
        : products.map((_, i) => i);

      const next = [...products];
      for (const i of indices) {
        const row = products[i];
        if (!row) continue;
        const [adjusted] = adjustCollectionProductsPrices([row], pipe);
        next[i] = adjusted;
      }

      setCollectionData((prev) => (prev ? { ...prev, products: next } : prev));
      setListCurrencyCode(toCurrency);
    } catch (e) {
      setPriceError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setPriceAdjustLoading(false);
    }
  };

  const importCollectionToShopify = async () => {
    if (!collectionData || !selectedStore) return;
    
    setImportingCollection(true);
    
    try {
      const productsToImport = (collectionData.products as unknown[]).filter((_, index: number) => 
        selectedProducts.includes(index)
      );

      // Set initial progress
      setImportProgress({ current: 0, total: productsToImport.length, currentProduct: collectionMode === 'new' ? 'Creating collection...' : 'Starting import...' });

      let collectionGid;
      let collectionId;

      // Step 1: Create new collection OR use existing collections
      if (collectionMode === 'new') {
        // Create a new collection
        console.log('🆕 Creating new collection with name:', newCollectionName);
        
        // Generate a unique handle from the new collection name
        const newHandle = newCollectionName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
          + '-' + Date.now(); // Add timestamp to ensure uniqueness
        
        console.log('📝 Using handle:', newHandle);
        
        const collectionResponse = await fetch('/api/add-collection-to-shopify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionOnly: true,
            title: newCollectionName,
            handle: newHandle, // Use the new unique handle
            body_html: collectionData.body_html || '',
            sort_order: collectionData.sort_order,
            published_at: collectionData.published_at,
            storeId: selectedStore.id,
          }),
        });

        const collectionResult = await collectionResponse.json();

        if (!collectionResult.success) {
          throw new Error(collectionResult.error || 'Failed to create collection');
        }

        console.log('✅ Collection created:', collectionResult.collection);
        collectionGid = collectionResult.collection?.gid; // Use GraphQL GID
        collectionId = collectionResult.collection?.id; // Legacy ID for display
      } else {
        // Using existing collections - we'll add products to them later
        // Use first selected collection as primary for tracking
        if (selectedCollections.length === 0) {
          throw new Error('Please select at least one collection');
        }
        collectionGid = `gid://shopify/Collection/${selectedCollections[0]}`;
        collectionId = selectedCollections[0];
      }

      // Step 2: Import products in parallel batches (translate first if language selected)
      let imported = 0;
      let failed = 0;
      const batchSize = 20; // Import 20 products at once (fast and safe for Shopify rate limits)
      const productIdMap: Map<number, string> = new Map(); // Track originalIndex -> productGid

      for (let i = 0; i < productsToImport.length; i += batchSize) {
        const batch = productsToImport.slice(i, i + batchSize);
        
        // Step 2a: Translate batch if language selected
        let translatedBatch = batch;
        if (selectedLanguage) {
          console.log(`🌍 Translating products ${i + 1}-${i + batch.length}...`);
          setImportProgress({ 
            current: i, 
            total: productsToImport.length, 
            currentProduct: `Translating products ${i + 1}-${Math.min(i + batchSize, productsToImport.length)}...` 
          });

          // Translate all products in batch in parallel
          const translationPromises = batch.map(async (product) => {
            const productTyped = product as CollectionProduct;
            try {
              // Format productData for the translate API (same format as single product import)
              const productData = {
                title: productTyped.title || '',
                description: productTyped.body_html || '',
                options: productTyped.options || []
              };

              const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productData,
                  targetLang: selectedLanguage,
                  enhancementPrompt: enhancementPrompt || undefined,
                }),
              });

              if (!response.ok) {
                console.error(`Failed to translate ${productTyped.title}`);
                return productTyped; // Return original if translation fails
              }

              const data = await response.json();
              const translatedData = data.translatedData;
              
              return {
                ...productTyped,
                title: translatedData.title || productTyped.title,
                body_html: translatedData.description || productTyped.body_html,
                options: translatedData.options || productTyped.options,
              } as CollectionProduct;
            } catch (error) {
              console.error(`Error translating ${productTyped.title}:`, error);
              return productTyped; // Return original if error
            }
          });

          translatedBatch = await Promise.all(translationPromises);
          console.log(`✅ Translated ${translatedBatch.length} products`);
        }

        // Step 2b: Import translated/original products in batch concurrently
        console.log(`📦 Importing products ${i + 1}-${i + translatedBatch.length}...`);
        const batchPromises = translatedBatch.map(async (product, batchIndex) => {
          const globalIndex = i + batchIndex;
          const productTyped = product as CollectionProduct;
          setImportProgress({ 
            current: globalIndex, 
            total: productsToImport.length, 
            currentProduct: productTyped.title || 'Unknown product'
          });

          let retries = 0;
          const maxRetries = 3;
          
          while (retries < maxRetries) {
            try {
              const productResponse = await fetch('/api/add-collection-to-shopify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productOnly: true,
                  product: product,
                  collectionId: collectionGid,
                  storeId: selectedStore.id,
                }),
              });

              // Check for rate limiting (429 status)
              if (productResponse.status === 429) {
                retries++;
                const waitTime = 1000 * Math.pow(2, retries); // Exponential backoff
                console.log(`Rate limited on ${productTyped.title}, waiting ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              }

              const productResult = await productResponse.json();
              
              if (productResult.success) {
                console.log(`✅ Product ${globalIndex + 1}: "${productTyped.title}" imported, ID: ${productResult.product?.id}`);
                return { 
                  success: true, 
                  product: productTyped.title || 'Unknown',
                  productId: productResult.product?.id,
                  originalIndex: globalIndex
                };
              } else {
                console.error('Failed to import product:', productTyped.title, productResult.error);
                return { success: false, product: productTyped.title || 'Unknown', error: productResult.error };
              }
            } catch (error) {
              retries++;
              if (retries >= maxRetries) {
                console.error('Error importing product after retries:', productTyped.title, error);
                return { success: false, product: productTyped.title || 'Unknown', error };
              }
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            }
          }
          
          return { success: false, product: productTyped.title || 'Unknown' };
        });

        // Wait for entire batch to complete
        const batchResults = await Promise.all(batchPromises);
        
        // Count successes and failures, store product IDs with their original index
        batchResults.forEach(result => {
          if (result.success) {
            imported++;
            if (result.productId && result.originalIndex !== undefined) {
              const productGid = `gid://shopify/Product/${result.productId}`;
              productIdMap.set(result.originalIndex, productGid);
              console.log(`📝 Tracked product at index ${result.originalIndex}: ${productGid}`);
            } else {
              console.warn(`⚠️ Product imported but missing ID or index:`, result);
            }
          } else {
            failed++;
          }
        });

        console.log(`📊 Batch complete: ${imported} imported, ${failed} failed. Total tracked: ${productIdMap.size}`);

        // Update progress after batch
        setImportProgress({ 
          current: Math.min(i + batchSize, productsToImport.length), 
          total: productsToImport.length, 
          currentProduct: `Imported ${imported} products...` 
        });

        // Small delay between batches to be safe (reduced for larger batches)
        if (i + batchSize < productsToImport.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between batches
        }
      }

      // Step 2.5: Reorder products in collection to preserve original order
      console.log(`🎯 All products imported. ProductIdMap size: ${productIdMap.size}`);
      
      if (productIdMap.size > 0) {
        try {
          setImportProgress({ 
            current: productsToImport.length, 
            total: productsToImport.length, 
            currentProduct: 'Reordering products...' 
          });

          // Get product IDs in original order
          const orderedProductIds = Array.from(productIdMap.entries())
            .sort((a, b) => a[0] - b[0]) // Sort by original index
            .map(([, productGid]) => productGid);

          console.log('🔄 Reordering', orderedProductIds.length, 'products to preserve original order...');
          console.log('Product IDs:', orderedProductIds);

          const reorderResponse = await fetch('/api/reorder-collection-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionGid: collectionGid,
              productIds: orderedProductIds,
              storeId: selectedStore.id,
            }),
          });

          const reorderResult = await reorderResponse.json();
          
          if (reorderResult.success) {
            console.log('✅ Products successfully reordered in collection!');
          } else {
            console.error('❌ Failed to reorder products:', reorderResult.error);
          }
        } catch (error) {
          console.error('❌ Failed to reorder products:', error);
          // Don't fail the whole import if reordering fails
        }
      } else {
        console.warn('⚠️ No products tracked for reordering!');
      }

      // Step 3: Add to additional existing collections if selected (and not already added in step 2)
      if (collectionMode === 'existing' && selectedCollections.length > 1) {
        // Skip the first collection since products were already added to it
        const additionalCollections = selectedCollections.slice(1);
        
        setImportProgress({ 
          current: productsToImport.length, 
          total: productsToImport.length, 
          currentProduct: 'Adding to additional collections...' 
        });
        
        for (const existingCollectionId of additionalCollections) {
          // Convert legacy ID to GID format for existing collections
          const existingCollectionGid = `gid://shopify/Collection/${existingCollectionId}`;
          
          for (const product of productsToImport) {
            try {
              await fetch('/api/add-collection-to-shopify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productOnly: true,
                  product: product,
                  collectionId: existingCollectionGid,
                  storeId: selectedStore.id,
                }),
              });
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.error('Error adding product to existing collection:', error);
            }
          }
        }
      }

      setCollectionImportStatus({
        type: 'success',
        message: `Collection imported with ${imported} products! ${failed > 0 ? `(${failed} failed)` : ''} Products ordered correctly.`,
        collectionId: collectionId?.toString(),
      });
      setTimeout(() => setCollectionImportStatus(null), 10000);
      
      // DON'T clear collection data - keep user on page
      // setCollectionData(null);
      // setCollectionUrl('');
      setImportProgress({ current: 0, total: 0, currentProduct: '' });
    } catch (err) {
      setCollectionImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to import collection',
      });
      setTimeout(() => setCollectionImportStatus(null), 5000);
      setImportProgress({ current: 0, total: 0, currentProduct: '' });
    } finally {
      setImportingCollection(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="bg-white rounded-xl w-full max-w-6xl flex flex-col shadow-lg border border-gray-200" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => {
              setCollectionData(null);
              setCollectionUrl('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
          <DropdownMenu
            open={priceMenuOpen}
            onOpenChange={(open) => {
              setPriceMenuOpen(open);
              if (!open) setPriceError(null);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 h-9 px-4 text-xs font-medium"
              >
                <CircleDollarSign size={16} className="mr-2" />
                Adjust prices
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border-gray-200 w-[400px] p-0 shadow-xl"
            >
              <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
                <p className="text-xs font-semibold text-emerald-900">Currency & pricing</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Order: convert (ECB via Frankfurter) → percent off → cap in target currency → cent ending. The product list updates as soon as you apply.
                </p>
              </div>

              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-700">Prices are in</Label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => {
                        setFromCurrency(e.target.value);
                        setRatePreview(null);
                      }}
                      className="mt-1 w-full h-9 rounded-md border border-gray-300 bg-white text-gray-900 text-xs px-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {FRANKFURTER_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-700">Convert to</Label>
                    <select
                      value={toCurrency}
                      onChange={(e) => {
                        setToCurrency(e.target.value);
                        setRatePreview(null);
                      }}
                      className="mt-1 w-full h-9 rounded-md border border-gray-300 bg-white text-gray-900 text-xs px-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {FRANKFURTER_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {ratePreview && fromCurrency !== toCurrency && (
                  <p className="text-[11px] text-gray-600">
                    1 {fromCurrency} ≈ {ratePreview.rate.toFixed(4)} {toCurrency}
                    {ratePreview.date ? ` (ECB: ${ratePreview.date})` : ''}
                  </p>
                )}
              </div>

              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-700">Adjust price (%)</Label>
                    <Input
                      type="number"
                      step={1}
                      placeholder="e.g. 10 or -20"
                      value={adjustPercentInput}
                      onChange={(e) => setAdjustPercentInput(e.target.value)}
                      className="mt-1 h-9 text-xs text-gray-900 bg-white"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Positive = raise, negative = lower</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-700">Max price cap ({toCurrency})</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="No cap"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="mt-1 h-9 text-xs text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-700 mb-2 block">Round to ending</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      ['none', 'No rounding'],
                      ['0.95', '.95'],
                      ['0.90', '.90'],
                      ['0.99', '.99'],
                      ['custom', 'Custom'],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRoundMode(key)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          roundMode === key
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {roundMode === 'custom' && (
                    <Input
                      type="number"
                      step={0.01}
                      min={0.01}
                      max={0.99}
                      value={customEndingInput}
                      onChange={(e) => setCustomEndingInput(e.target.value)}
                      placeholder="0.95"
                      className="mt-2 h-9 text-xs text-gray-900 bg-white"
                    />
                  )}
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Chooses the highest price ≤ the current amount with that cent ending (e.g. 12.40 → 11.99 with .99).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="price-selected-only"
                    checked={applyPricesToSelectedOnly}
                    onCheckedChange={(c) => setApplyPricesToSelectedOnly(c === true)}
                  />
                  <label htmlFor="price-selected-only" className="text-xs text-gray-700 cursor-pointer">
                    Only selected products ({selectedProducts.length})
                  </label>
                </div>
                {priceError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1.5">
                    {priceError}
                  </p>
                )}
                <Button
                  type="button"
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  disabled={priceAdjustLoading}
                  onClick={() => void applyPriceAdjustments()}
                >
                  {priceAdjustLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying…
                    </span>
                  ) : (
                    'Apply to product list'
                  )}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={isDropdownOpen} onOpenChange={(open) => {
            setIsDropdownOpen(open);
            if (!open) {
              setLanguageSearch('');
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-0 h-9 px-4 text-xs font-medium"
              >
                <Sparkles size={16} className="mr-2" />
                AI Enhance & Translate
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200 w-[380px] p-0 shadow-xl">
              {/* Info Banner */}
              <div className="bg-purple-50 border-b border-purple-100 px-4 py-3">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-purple-900">Translation happens during import</p>
                    <p className="text-xs text-purple-700 mt-0.5">Products will be translated in batches as they&apos;re being imported to your store</p>
                  </div>
                </div>
              </div>

              {/* AI Prompt Section */}
              <div className="p-4 border-b border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  AI Enhancement Prompt (Optional)
                </label>
                <textarea
                  value={enhancementPrompt}
                  onChange={(e) => setEnhancementPrompt(e.target.value)}
                  placeholder="e.g., Make it more persuasive, add emoji, improve SEO..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 text-xs text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Leave empty to only translate without AI enhancement
                </p>
              </div>

              {/* Language Selection */}
              <div className="p-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Target Language
                </label>
                <Input
                  placeholder="Search languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-900 h-9 text-xs mb-3"
                />
                <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 border border-gray-200 rounded-lg">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                      }}
                      className={`w-full text-left px-3 py-2.5 cursor-pointer text-sm transition-all flex items-center justify-between ${
                        selectedLanguage === lang.code
                          ? 'bg-purple-100 text-purple-900 font-medium'
                          : 'text-gray-900 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {selectedLanguage === lang.code && (
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                
                {selectedLanguage && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedLanguage(null);
                        setEnhancementPrompt('');
                      }}
                      className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium py-2 rounded-md transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Collection Settings Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Import to Collection</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedProducts.length} of {collectionData.products?.length || 0} products selected</p>
              </div>
            </div>
            
            {/* Horizontal Layout */}
            <div className="flex items-center gap-4">
              {/* Radio Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setCollectionMode('new')}
                  className={`px-5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    collectionMode === 'new' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  New Collection
                </button>
                <button
                  onClick={() => setCollectionMode('existing')}
                  className={`px-5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    collectionMode === 'existing' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Existing Collection
                </button>
              </div>

              {/* Input/Dropdown based on mode */}
              <div className="flex-1 max-w-xl relative">
                <div 
                  key={collectionMode}
                  className="animate-fadeIn"
                  style={{
                    animation: 'fadeSlideIn 0.3s ease-out'
                  }}
                >
                  {collectionMode === 'new' ? (
                    <Input
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 h-10 text-sm w-full"
                      placeholder="Enter collection name..."
                    />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-2.5 text-sm hover:border-gray-400 text-left flex items-center justify-between">
                          <span className={`truncate ${selectedCollections.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                            {selectedCollectionNames}
                          </span>
                          <svg className="w-4 h-4 flex-shrink-0 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border-gray-200 max-h-[300px] overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                        {collections.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-gray-500 text-center">No collections found</div>
                        ) : (
                          collections.map((collection: { id: string; title: string; [key: string]: unknown }) => (
                            <div
                              key={collection.id}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleCollection(collection.id.toString());
                              }}
                              className="text-gray-900 cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-sm hover:bg-gray-50 transition-colors text-sm"
                          >
                            <div 
                              className="w-4 h-4 border rounded flex items-center justify-center border-gray-300"
                              style={{
                                backgroundColor: selectedCollections.includes(collection.id.toString()) ? '#7cfc5c' : 'white',
                                borderColor: selectedCollections.includes(collection.id.toString()) ? '#7cfc5c' : '#d1d5db'
                              }}
                            >
                              {selectedCollections.includes(collection.id.toString()) && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1f2937' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span>{collection.title}</span>
                          </div>
                        ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Select All Checkbox */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="peer sr-only"
                />
                <div 
                  className="w-4 h-4 border-2 rounded transition-all border-gray-300"
                  style={{
                    backgroundColor: selectAll ? '#7cfc5c' : 'white',
                    borderColor: selectAll ? '#7cfc5c' : '#d1d5db'
                  }}
                >
                  {selectAll && (
                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: '#1f2937' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-medium text-gray-900">Select All</span>
            </label>
          </div>

          {/* Products List */}
          {collectionData.products && collectionData.products.length > 0 ? (
            <div className="space-y-2">
              {(collectionData.products as CollectionProduct[]).map((product, index: number) => (
                <label
                  key={index}
                  className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-neutral-50 transition-all cursor-pointer group ${
                    selectedProducts.includes(index) ? 'border-neutral-400' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(index)}
                      onChange={() => toggleProduct(index)}
                      className="peer sr-only"
                    />
                    <div 
                      className="w-4 h-4 border-2 rounded transition-all border-gray-300"
                      style={{
                        backgroundColor: selectedProducts.includes(index) ? '#7cfc5c' : 'white',
                        borderColor: selectedProducts.includes(index) ? '#7cfc5c' : '#d1d5db'
                      }}
                    >
                      {selectedProducts.includes(index) && (
                        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: '#1f2937' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0].src} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {product.variants && product.variants[0] && (
                        <>
                          {product.variants[0].compare_at_price && 
                           parseFloat(product.variants[0].compare_at_price) > parseFloat(product.variants[0].price) && (
                            <span className="text-gray-500 text-xs line-through">
                              {currencySymbol(listCurrencyCode)}
                              {product.variants[0].compare_at_price}
                            </span>
                          )}
                          <span className="text-gray-900 font-semibold text-sm">
                            {currencySymbol(listCurrencyCode)}
                            {product.variants[0].price}
                          </span>
                        </>
                      )}
                      {product.variants && product.variants.length > 1 && (
                        <span className="text-gray-500 text-xs">
                          • {product.variants.length} variants
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found in this collection</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          {/* Progress Bar */}
          {importingCollection && importProgress.total > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Importing products: {importProgress.current} / {importProgress.total}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((importProgress.current / importProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
              {importProgress.currentProduct && (
                <p className="text-xs text-gray-500 mt-2 truncate">
                  Currently importing: <span className="font-medium text-gray-700">{importProgress.currentProduct}</span>
                </p>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={importCollectionToShopify}
              disabled={importingCollection || !selectedStore || selectedProducts.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 h-10 font-medium shadow-lg shadow-green-600/20"
            >
              {importingCollection ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Importing...
                </div>
              ) : (
                `Import Collection`
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

