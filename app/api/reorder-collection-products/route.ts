import { NextRequest } from 'next/server';
import { jsonError, jsonSuccess } from '@/lib/api/http';
import { devLog } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';
import { checkRateLimit } from '@/lib/rate-limit';

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

    if (!storeId || !collectionGid || !productIds) return jsonError('Missing required fields', 400);

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`reorder-collection:${user.id}`, 30)) return jsonError('Too many requests. Please slow down.', 429);

    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('id, user_id, shopify_store_url, shopify_token, connection_status')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) return jsonError('Store not found', 404);

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) return jsonError(STORE_NOT_CONNECTED_MESSAGE, 400);

    // Reorder products in collection using GraphQL
    devLog('🔄 Reordering', productIds.length, 'products in collection', collectionGid);
    
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
      devLog('✅ Collection set to MANUAL sort order');
    } catch (error) {
      devLog(
        'collectionUpdate (MANUAL sort) skipped:',
        error instanceof Error ? error.message : error,
      );
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

    devLog('📦 Moving', moves.length, 'products to their correct positions');

    const data = await shopifyGraphQL(
      store.shopify_store_url,
      accessToken,
      mutation,
      { id: collectionGid, moves }
    );

    if (data.collectionReorderProducts.userErrors.length > 0) {
      return jsonError(JSON.stringify(data.collectionReorderProducts.userErrors), 400);
    }

    devLog('Products reordered successfully');
    return jsonSuccess({});
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to reorder', 500);
  }
}
