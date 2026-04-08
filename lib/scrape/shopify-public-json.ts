/** Fetch Shopify legacy *.json endpoints with browser-like headers (avoids bad/blocked bot responses). */
export async function fetchShopifyPublicJson<T = unknown>(
  jsonUrl: string,
  storeHost: string,
): Promise<T> {
  const res = await fetch(jsonUrl, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json, text/javascript, */*;q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: `https://${storeHost}/`,
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
