/**
 * Resolves the Admin API access token for Shopify calls, or null if the store
 * has not finished OAuth or has no token.
 */
export function getShopifyAccessTokenForApi(store: {
  shopify_token?: string | null;
  connection_status?: string | null;
}): string | null {
  const token = typeof store.shopify_token === 'string' ? store.shopify_token.trim() : '';
  if (!token) return null;
  if (store.connection_status === 'pending_oauth') return null;
  return token;
}

export const STORE_NOT_CONNECTED_MESSAGE =
  'This store is not connected yet. Finish Shopify authorization (Add store → approve in Shopify), then try again.';
