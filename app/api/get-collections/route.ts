import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';
import { jsonError, jsonOk } from '@/lib/api/http';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();

    if (!storeId) return jsonError('Store ID is required', 400);

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`get-collections:${user.id}`, 60)) return jsonError('Too many requests. Please slow down.', 429);

    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('id, user_id, shopify_store_url, shopify_token, connection_status')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) return jsonError('Store not found', 404);

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) return jsonError(STORE_NOT_CONNECTED_MESSAGE, 400);

    const [customRes, smartRes] = await Promise.all([
      fetch(`https://${store.shopify_store_url}/admin/api/2024-01/custom_collections.json`, {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }),
      fetch(`https://${store.shopify_store_url}/admin/api/2024-01/smart_collections.json`, {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }),
    ]);

    if (!customRes.ok) {
      const errorText = await customRes.text();
      return jsonError(`Failed to fetch collections: ${errorText}`, customRes.status);
    }

    const customData = await customRes.json();
    const smartCollections = smartRes.ok ? (await smartRes.json()).smart_collections ?? [] : [];

    return jsonOk({ collections: [...(customData.custom_collections ?? []), ...smartCollections] });
  } catch (error) {
    return jsonError('Failed to fetch collections', 500);
  }
}

