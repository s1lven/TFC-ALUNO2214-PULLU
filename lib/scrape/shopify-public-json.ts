/** Fetch Shopify legacy *.json endpoints.
 * Intentionally avoids Accept-Language / geo headers so Shopify Markets
 * doesn't serve a localised (wrong-currency) price instead of the base price. */
export async function fetchShopifyPublicJson<T = unknown>(
  jsonUrl: string,
  _storeHost: string,
): Promise<T> {
  const res = await fetch(jsonUrl, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      'User-Agent': 'Pullu-Scraper/1.0',
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shopify returned HTTP ${res.status}: ${text.slice(0, 160)}`);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('json') && text.trimStart().startsWith('<')) {
    throw new Error(
      'Shopify returned HTML instead of product JSON (wrong handle, password page, or bot block). Check the product URL.',
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Shopify response was not valid JSON.');
  }
}
