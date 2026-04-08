import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
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

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) {
      return NextResponse.json({ error: STORE_NOT_CONNECTED_MESSAGE }, { status: 400 });
    }

    // Fetch shop info from Shopify
    let shopName = store.shopify_store_url.replace('.myshopify.com', '');
    try {
      const shopResponse = await fetch(
        `https://${store.shopify_store_url}/admin/api/2024-01/shop.json`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        }
      );

      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        if (shopData.shop && shopData.shop.name) {
          shopName = shopData.shop.name;
        }
      }
    } catch (error) {
      console.error('Failed to fetch shop name:', error);
    }

    // Update store name in database
    const { data: updatedStore, error: updateError } = await supabase
      .from('shopify_stores')
      .update({ store_name: shopName })
      .eq('id', storeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store name:', updateError);
      return NextResponse.json(
        { error: 'Failed to update store name' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error) {
    console.error('Error in refresh-store-name:', error);
    return NextResponse.json(
      { error: 'Failed to refresh store name' },
      { status: 500 }
    );
  }
}

