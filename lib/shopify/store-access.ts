import { decrypt } from '@/lib/crypto';

export function getShopifyAccessTokenForApi(store: {
  shopify_token?: string | null;
  connection_status?: string | null;
}): string | null {
  const raw = typeof store.shopify_token === 'string' ? store.shopify_token.trim() : '';
  if (!raw) return null;
  if (store.connection_status === 'pending_oauth') return null;
  try {
    return decrypt(raw);
  } catch {
    return null;
  }
}

export const STORE_NOT_CONNECTED_MESSAGE =
  'This store is not connected yet. Finish Shopify authorization (Add store → approve in Shopify), then try again.';
