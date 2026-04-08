import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';

// Helper function to make GraphQL requests to Shopify
async function shopifyGraphQL(shopifyStoreUrl: string, shopifyToken: string, query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(`https://${shopifyStoreUrl}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL request failed: ${errorText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

export async function POST(request: NextRequest) {
  try {
    const { collectionGid, productIds, storeId } = await request.json();

    if (!storeId || !collectionGid || !productIds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch store credentials
    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) {
      return NextResponse.json({ error: STORE_NOT_CONNECTED_MESSAGE }, { status: 400 });
    }

    // Reorder products in collection using GraphQL
    console.log('🔄 Reordering', productIds.length, 'products in collection', collectionGid);
    
    // First, update collection to manual sort order
    const updateCollectionMutation = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            sortOrder
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      await shopifyGraphQL(
        store.shopify_store_url,
        accessToken,
        updateCollectionMutation,
        { 
          input: {
            id: collectionGid,
            sortOrder: 'MANUAL'
          }
        }
      );
      console.log('✅ Collection set to MANUAL sort order');
    } catch (error) {
      console.error('Warning: Could not set manual sort order:', error);
    }

    // Now reorder the products
    const mutation = `
      mutation collectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
        collectionReorderProducts(id: $id, moves: $moves) {
          job {
            id
            done
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Build moves array - move each product to its correct position
    const moves = productIds.map((productId: string, index: number) => ({
      id: productId,
      newPosition: index.toString()
    }));

    console.log('📦 Moving', moves.length, 'products to their correct positions');

    const data = await shopifyGraphQL(
      store.shopify_store_url,
      accessToken,
      mutation,
      { id: collectionGid, moves }
    );

    if (data.collectionReorderProducts.userErrors.length > 0) {
      console.error('❌ Reorder errors:', data.collectionReorderProducts.userErrors);
      return NextResponse.json(
        { success: false, error: JSON.stringify(data.collectionReorderProducts.userErrors) },
        { status: 400 }
      );
    }

    console.log('✅ Products reordered successfully!');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering products:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to reorder' },
      { status: 500 }
    );
  }
}
