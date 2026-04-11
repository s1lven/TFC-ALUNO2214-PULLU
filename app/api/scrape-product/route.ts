import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/http';
import { devLog } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { isPublicHttpUrlForFetch } from '@/lib/security/public-url';
import { fetchShopifyPublicJson } from '@/lib/scrape/shopify-public-json';
import { extractShopifyProductHandle, extractShopifyLocale } from '@/lib/scrape/shopify-url';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`scrape-product:${user.id}`, 60)) return jsonError('Too many requests. Please slow down.', 429);

    const { url } = await request.json();

    if (!url) return jsonError('URL is required', 400);

    let productUrl;
    try {
      productUrl = new URL(url);
    } catch {
      return jsonError('Invalid URL', 400);
    }

    if (!isPublicHttpUrlForFetch(productUrl)) return jsonError('URL host is not allowed', 400);

    const domain = productUrl.hostname;
    const productHandle = extractShopifyProductHandle(productUrl.pathname);
    // Preserve locale so Shopify returns the correct market's prices
    const locale = extractShopifyLocale(productUrl.pathname);
    const localePrefix = locale ? `/${locale}` : '';

    if (!productHandle) {
      return jsonError('Could not find a product handle in the URL (use a link like /products/your-handle).', 400);
    }

    const productJsonUrl = `https://${domain}${localePrefix}/products/${productHandle}.json`;
    devLog('Fetching:', productJsonUrl);

    const productData = await fetchShopifyPublicJson<{ product?: unknown }>(productJsonUrl, domain);

    if (!productData.product) return jsonError('Product not found', 404);

    return jsonOk(productData.product as Record<string, unknown>);
  } catch (error) {
    return jsonError(`Failed to scrape product: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}
