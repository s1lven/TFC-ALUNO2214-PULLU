/**
 * Parse Shopify storefront paths so we always hit `/products/{handle}.json` correctly.
 * Fixes pasted links like `/products/foo.json`, `/en-ca/products/foo`, etc.
 */
export function extractShopifyProductHandle(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  const i = parts.indexOf('products');
  if (i !== -1 && parts[i + 1]) {
    const h = parts[i + 1].replace(/\.json$/i, '');
    return h || null;
  }
  const last = parts[parts.length - 1]?.replace(/\.json$/i, '') ?? '';
  return last || null;
}

export function extractShopifyCollectionHandle(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  const i = parts.indexOf('collections');
  if (i !== -1 && parts[i + 1]) {
    const h = parts[i + 1].replace(/\.json$/i, '');
    if (h === 'products') return null;
    return h || null;
  }
  const last = parts[parts.length - 1]?.replace(/\.json$/i, '') ?? '';
  return last || null;
}
