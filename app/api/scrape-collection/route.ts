import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPublicHttpUrlForFetch } from '@/lib/security/public-url';
import { fetchShopifyPublicJson } from '@/lib/scrape/shopify-public-json';
import { extractShopifyCollectionHandle } from '@/lib/scrape/shopify-url';

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

    let collectionUrl;
    try {
      collectionUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!isPublicHttpUrlForFetch(collectionUrl)) {
      return NextResponse.json({ error: 'URL host is not allowed' }, { status: 400 });
    }

    const domain = collectionUrl.hostname;
    const collectionHandle = extractShopifyCollectionHandle(collectionUrl.pathname);

    if (!collectionHandle) {
      return NextResponse.json(
        { error: 'Could not find a collection handle in the URL (use /collections/your-handle).' },
        { status: 400 },
      );
    }

    const collectionJsonUrl = `https://${domain}/collections/${collectionHandle}.json`;

    console.log('Fetching collection:', collectionJsonUrl);

    const collectionData = await fetchShopifyPublicJson<{ collection?: unknown }>(
      collectionJsonUrl,
      domain,
    );

    if (!collectionData.collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const products: unknown[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const productsUrl = `https://${domain}/collections/${collectionHandle}/products.json?page=${page}&limit=250`;
      console.log(`Fetching products page ${page}:`, productsUrl);

      let productsData: { products?: unknown[] };
      try {
        productsData = await fetchShopifyPublicJson<{ products?: unknown[] }>(productsUrl, domain);
      } catch (e) {
        console.error(`Failed to fetch products page ${page}:`, e);
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

    console.log(`Fetched ${products.length} products from collection`);

    return NextResponse.json({
      ...collectionData.collection,
      products: products,
      productCount: products.length,
    });
  } catch (error) {
    console.error('Collection scraping error:', error);
    return NextResponse.json(
      { error: `Failed to scrape collection: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
