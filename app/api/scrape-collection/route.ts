import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/http';
import { devLog } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { isPublicHttpUrlForFetch } from '@/lib/security/public-url';
import { fetchShopifyPublicJson } from '@/lib/scrape/shopify-public-json';
import { extractShopifyCollectionHandle, extractShopifyLocale } from '@/lib/scrape/shopify-url';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`scrape-collection:${user.id}`, 20)) return jsonError('Too many requests. Please slow down.', 429);

    const { url } = await request.json();

    if (!url) return jsonError('URL is required', 400);

    let collectionUrl;
    try {
      collectionUrl = new URL(url);
    } catch {
      return jsonError('Invalid URL', 400);
    }

    if (!isPublicHttpUrlForFetch(collectionUrl)) return jsonError('URL host is not allowed', 400);

    const domain = collectionUrl.hostname;
    const collectionHandle = extractShopifyCollectionHandle(collectionUrl.pathname);
    // Preserve the locale prefix so Shopify serves the correct market's prices
    // instead of routing by Vercel server IP (which returns USD for non-US stores).
    const locale = extractShopifyLocale(collectionUrl.pathname);
    const localePrefix = locale ? `/${locale}` : '';

    if (!collectionHandle) {
      return jsonError('Could not find a collection handle in the URL (use /collections/your-handle).', 400);
    }

    const collectionJsonUrl = `https://${domain}${localePrefix}/collections/${collectionHandle}.json`;

    devLog('Fetching collection:', collectionJsonUrl);

    const collectionData = await fetchShopifyPublicJson<{ collection?: unknown }>(
      collectionJsonUrl,
      domain,
    );

    if (!collectionData.collection) return jsonError('Collection not found', 404);

    const products: unknown[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const productsUrl = `https://${domain}${localePrefix}/collections/${collectionHandle}/products.json?page=${page}&limit=250`;
      devLog(`Fetching products page ${page}:`, productsUrl);

      let productsData: { products?: unknown[] };
      try {
        productsData = await fetchShopifyPublicJson<{ products?: unknown[] }>(productsUrl, domain);
      } catch (e) {
        break;
      }

      if (productsData.products && productsData.products.length > 0) {
        products.push(...productsData.products);
        page++;

        if (productsData.products.length < 250) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    devLog(`Fetched ${products.length} products from collection`);

    return jsonOk({
      ...(collectionData.collection as Record<string, unknown>),
      products,
      productCount: products.length,
    });
  } catch (error) {
    return jsonError(`Failed to scrape collection: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}
