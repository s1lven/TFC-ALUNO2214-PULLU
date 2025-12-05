import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch store credentials
    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Fetch collections from Shopify
    const response = await fetch(
      `https://${store.shopify_store_url}/admin/api/2024-01/custom_collections.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': store.shopify_token,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch collections: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Also fetch smart collections
    const smartResponse = await fetch(
      `https://${store.shopify_store_url}/admin/api/2024-01/smart_collections.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': store.shopify_token,
        },
      }
    );

    let smartCollections = [];
    if (smartResponse.ok) {
      const smartData = await smartResponse.json();
      smartCollections = smartData.smart_collections || [];
    }

    // Combine both types of collections
    const allCollections = [
      ...(data.custom_collections || []),
      ...smartCollections,
    ];

    return NextResponse.json({
      collections: allCollections,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

