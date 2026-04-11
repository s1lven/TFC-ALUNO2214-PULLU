'use client';

import { useCallback, useState } from 'react';
import type { Product, ProductOption } from '@/types';
import type { ProductImportStatus, TranslationStatus } from '@/components/dashboard/dashboard-notification-toasts';

export function useProductWorkspace() {
  const [url, setUrl] = useState('');
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [importStatus, setImportStatus] = useState<ProductImportStatus>(null);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>(null);

  const scrapeProduct = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error('Failed to scrape product');
      const data = await response.json();
      setProductData(data);
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

  const reset = () => {
    setProductData(null);
    setUrl('');
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    url, setUrl,
    productData, setProductData,
    loading, error,
    clearError,
    scrapeProduct, reset,
    editableTitle, setEditableTitle,
    editableHandle, setEditableHandle,
    editablePrice, setEditablePrice,
    editableComparePrice, setEditableComparePrice,
    editableDescriptionHtml, setEditableDescriptionHtml,
    editableOptions, setEditableOptions,
    editableVariants, setEditableVariants,
    addingToStore, setAddingToStore,
    translating, setTranslating,
    languageSearch, setLanguageSearch,
    isTaxable, setIsTaxable,
    trackStock, setTrackStock,
    selectedCollections, setSelectedCollections,
    importStatus, setImportStatus,
    translationStatus, setTranslationStatus,
  };
}
