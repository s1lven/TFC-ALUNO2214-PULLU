import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';
import { jsonError, jsonOk } from '@/lib/api/http';
import { checkRateLimit } from '@/lib/rate-limit';
import { devLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`refresh-store-name:${user.id}`, 10)) return jsonError('Too many requests. Please slow down.', 429);

    const { storeId } = await request.json();

    if (!storeId) return jsonError('Store ID is required', 400);

    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('id, user_id, shopify_store_url, shopify_token, connection_status')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) return jsonError('Store not found', 404);

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) return jsonError(STORE_NOT_CONNECTED_MESSAGE, 400);

    let shopName = store.shopify_store_url.replace('.myshopify.com', '');
    try {
      const shopResponse = await fetch(
        `https://${store.shopify_store_url}/admin/api/2024-01/shop.json`,
        { headers: { 'X-Shopify-Access-Token': accessToken } },
      );
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        if (shopData.shop?.name) shopName = shopData.shop.name;
      }
    } catch (error) {
      devLog(
        'shop.json fetch during refresh-store-name failed:',
        error instanceof Error ? error.message : error,
      );
    }

    const { data: updatedStore, error: updateError } = await supabase
      .from('shopify_stores')
      .update({ store_name: shopName })
      .eq('id', storeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return jsonError('Failed to update store name', 500);
    }

    return jsonOk({ store: updatedStore });
  } catch (error) {
    return jsonError('Failed to refresh store name', 500);
  }
}

