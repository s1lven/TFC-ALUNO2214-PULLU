'use client';

import { useCallback, useState } from 'react';
import type { CollectionImportStatus } from '@/components/dashboard/dashboard-notification-toasts';

export function useCollectionWorkspace() {
  const [collectionUrl, setCollectionUrl] = useState('');
  const [collectionData, setCollectionData] = useState<{ products?: unknown[]; [key: string]: unknown } | null>(null);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [importingCollection, setImportingCollection] = useState(false);
  const [collectionImportStatus, setCollectionImportStatus] = useState<CollectionImportStatus>(null);

  const scrapeCollection = async () => {
    if (!collectionUrl) return;
    setLoadingCollection(true);
    setCollectionError(null);
    try {
      const response = await fetch('/api/scrape-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const reset = () => {
    setCollectionData(null);
    setCollectionUrl('');
  };

  const clearCollectionError = useCallback(() => setCollectionError(null), []);

  return {
    collectionUrl, setCollectionUrl,
    collectionData, setCollectionData,
    loadingCollection, collectionError,
    clearCollectionError,
    importingCollection, setImportingCollection,
    collectionImportStatus, setCollectionImportStatus,
    scrapeCollection, reset,
  };
}
