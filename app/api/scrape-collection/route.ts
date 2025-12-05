import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let collectionUrl;
    try {
      collectionUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Extract store domain and collection handle from URL
    const domain = collectionUrl.hostname;
    const pathParts = collectionUrl.pathname.split('/').filter(part => part);
    const collectionHandle = pathParts[pathParts.length - 1];

    // Fetch collection data
    const collectionJsonUrl = `https://${domain}/collections/${collectionHandle}.json`;
    
    console.log('Fetching collection:', collectionJsonUrl);
    
    const collectionResponse = await fetch(collectionJsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!collectionResponse.ok) {
      throw new Error(`HTTP error! status: ${collectionResponse.status}`);
    }

    const collectionData = await collectionResponse.json();
    
    if (!collectionData.collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Fetch all products in the collection (with pagination)
    const products: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const productsUrl = `https://${domain}/collections/${collectionHandle}/products.json?page=${page}&limit=250`;
      console.log(`Fetching products page ${page}:`, productsUrl);
      
      const productsResponse = await fetch(productsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (!productsResponse.ok) {
        console.error(`Failed to fetch products page ${page}`);
        break;
      }

      const productsData = await productsResponse.json();
      
      if (productsData.products && productsData.products.length > 0) {
        products.push(...productsData.products);
        page++;
        
        // If we got less than 250 products, we've reached the end
        if (productsData.products.length < 250) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`Fetched ${products.length} products from collection`);

    // Return the collection data with all products
    return NextResponse.json({
      ...collectionData.collection,
      products: products,
      productCount: products.length,
    });

  } catch (error) {
    console.error('Collection scraping error:', error);
    return NextResponse.json(
      { error: `Failed to scrape collection: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

