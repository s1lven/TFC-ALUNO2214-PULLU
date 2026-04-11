'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ShopifyStore, Collection } from '@/types';

export function useStores() {
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<ShopifyStore | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  const fetchStores = useCallback(async () => {
    try {
      setLoadingStores(true);
      const response = await fetch('/api/get-stores');
      if (response.ok) {
        const data = await response.json();
        const list: ShopifyStore[] = data.stores || [];
        setStores(list);
        setSelectedStore((prev) => {
          if (!list.length) return null;
          if (prev && list.some((s) => s.id === prev.id)) {
            return list.find((s) => s.id === prev.id) ?? list[0];
          }
          return list[0];
        });
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoadingStores(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (!selectedStore?.id) return;
    fetch('/api/get-collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: selectedStore.id }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setCollections(data.collections || []); })
      .catch((e) => console.error('Failed to fetch collections:', e));
  }, [selectedStore]);

  return { stores, selectedStore, setSelectedStore, loadingStores, fetchStores, collections };
}
