import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPublicHttpUrlForFetch } from '@/lib/security/public-url';

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

    // Extract store domain and product handle from URL
    const domain = productUrl.hostname;
    const pathParts = productUrl.pathname.split('/').filter(part => part);
    const productHandle = pathParts[pathParts.length - 1];

    // Use the direct product.json endpoint (more reliable)
    const productJsonUrl = `https://${domain}/products/${productHandle}.json`;
    
    console.log('Fetching:', productJsonUrl);
    
    const productResponse = await fetch(productJsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!productResponse.ok) {
      throw new Error(`HTTP error! status: ${productResponse.status}`);
    }

    const productData = await productResponse.json();
    
    if (!productData.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Return the EXACT product data as it comes from Shopify
    return NextResponse.json(productData.product);

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: `Failed to scrape product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
