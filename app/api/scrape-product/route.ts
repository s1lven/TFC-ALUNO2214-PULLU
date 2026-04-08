import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPublicHttpUrlForFetch } from '@/lib/security/public-url';
import { fetchShopifyPublicJson } from '@/lib/scrape/shopify-public-json';
import { extractShopifyProductHandle, extractShopifyLocale } from '@/lib/scrape/shopify-url';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let productUrl;
    try {
      productUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!isPublicHttpUrlForFetch(productUrl)) {
      return NextResponse.json({ error: 'URL host is not allowed' }, { status: 400 });
    }

    const domain = productUrl.hostname;
    const productHandle = extractShopifyProductHandle(productUrl.pathname);
    // Preserve locale so Shopify returns the correct market's prices
    const locale = extractShopifyLocale(productUrl.pathname);
    const localePrefix = locale ? `/${locale}` : '';

    if (!productHandle) {
      return NextResponse.json(
        { error: 'Could not find a product handle in the URL (use a link like /products/your-handle).' },
        { status: 400 },
      );
    }

    const productJsonUrl = `https://${domain}${localePrefix}/products/${productHandle}.json`;

    console.log('Fetching:', productJsonUrl);

    const productData = await fetchShopifyPublicJson<{ product?: unknown }>(productJsonUrl, domain);

    if (!productData.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(productData.product);
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: `Failed to scrape product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
