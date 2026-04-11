'use client';

import { useState, useEffect } from 'react';

interface UseStoreConnectOptions {
  onConnected: () => void;
}

export function useStoreConnect({ onConnected }: UseStoreConnectOptions) {
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreSubdomain, setNewStoreSubdomain] = useState('');
  const [newStoreAlias, setNewStoreAlias] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newClientSecret, setNewClientSecret] = useState('');
  const [addingStore, setAddingStore] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify_connected') === '1') {
      onConnected();
      window.history.replaceState({}, '', '/dashboard');
    }
    const err = params.get('shopify_error');
    if (err) {
      setStoreError(params.get('shopify_message') || 'Shopify connection failed.');
      onConnected();
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [onConnected]);

  const resetForm = () => {
    setNewStoreSubdomain('');
    setNewStoreAlias('');
    setNewClientId('');
    setNewClientSecret('');
    setStoreError(null);
  };

  const startShopifyOAuth = async () => {
    if (!newStoreSubdomain?.trim() || !newStoreAlias?.trim() || !newClientId?.trim() || !newClientSecret?.trim()) {
      setStoreError('Enter your store subdomain, alias, client ID, and secret.');
      return;
    }
    setAddingStore(true);
    setStoreError(null);
    try {
      const response = await fetch('/api/shopify/oauth/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_subdomain: newStoreSubdomain.trim(),
          store_alias: newStoreAlias.trim(),
          client_id: newClientId.trim(),
          client_secret: newClientSecret.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start Shopify connection');
      if (!data.authorizationUrl) throw new Error('No authorization URL returned');
      window.location.href = data.authorizationUrl as string;
    } catch (err) {
      setStoreError(err instanceof Error ? err.message : 'An error occurred');
      setAddingStore(false);
    }
  };

  return {
    showAddStoreModal, setShowAddStoreModal,
    newStoreSubdomain, setNewStoreSubdomain,
    newStoreAlias, setNewStoreAlias,
    newClientId, setNewClientId,
    newClientSecret, setNewClientSecret,
    addingStore,
    storeError,
    resetForm,
    startShopifyOAuth,
  };
}
