/**
 * Parse Shopify storefront paths so we always hit the correct `.json` endpoint.
 * Fixes pasted links like `/products/foo.json`, `/en-au/products/foo`, etc.
 *
 * We also preserve any locale prefix (e.g. `en-au`) so Shopify returns prices
 * for the correct market instead of routing by Vercel server IP (which causes
 * USD prices to be returned for non-US stores).
 */

/** Returns the locale segment that precedes `collections` or `products`, e.g. `en-au`. */
export function extractShopifyLocale(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  const collIdx = parts.indexOf('collections');
  const prodIdx = parts.indexOf('products');
  const sectionIdx = Math.min(
    collIdx === -1 ? Infinity : collIdx,
    prodIdx === -1 ? Infinity : prodIdx,
  );
  if (sectionIdx === Infinity || sectionIdx === 0) return null;
  const candidate = parts[sectionIdx - 1] ?? '';
  // Shopify locales look like "en", "en-au", "fr-ch", "zh-TW", etc.
  if (/^[a-z]{2}(-[a-zA-Z]{2,4})?$/i.test(candidate)) {
    return candidate.toLowerCase();
  }
  return null;
}

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
