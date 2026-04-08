import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  buildAuthorizeUrl,
  generateOAuthNonce,
  getOAuthRedirectUri,
  normalizeShopifyHost,
} from '@/lib/shopify/oauth';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const shopSubdomain = typeof body.shop_subdomain === 'string' ? body.shop_subdomain : '';
    const storeAlias = typeof body.store_alias === 'string' ? body.store_alias.trim() : '';
    const clientId = typeof body.client_id === 'string' ? body.client_id.trim() : '';
    const clientSecret = typeof body.client_secret === 'string' ? body.client_secret.trim() : '';

    if (!shopSubdomain || !storeAlias || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Domain, alias, client ID, and client secret are required' },
        { status: 400 }
      );
    }

    let shopifyHost: string;
    try {
      shopifyHost = normalizeShopifyHost(
        shopSubdomain.includes('.myshopify.com') ? shopSubdomain : `${shopSubdomain}.myshopify.com`
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid shop domain' },
        { status: 400 }
      );
    }

    const appBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SHOPIFY_APP_URL ||
      `${request.nextUrl.protocol}//${request.headers.get('host') || 'localhost:3001'}`;
    const redirectUri =
      process.env.SHOPIFY_OAUTH_REDIRECT_URI || getOAuthRedirectUri(appBase);

    const nonce = generateOAuthNonce();

    await supabase
      .from('shopify_stores')
      .delete()
      .eq('user_id', user.id)
      .eq('shopify_store_url', shopifyHost)
      .eq('connection_status', 'pending_oauth');

    const { data: store, error: insertError } = await supabase
      .from('shopify_stores')
      .insert({
        user_id: user.id,
        shopify_store_url: shopifyHost,
        store_alias: storeAlias,
        store_name: storeAlias,
        shopify_client_id: clientId,
        shopify_client_secret: clientSecret,
        connection_status: 'pending_oauth',
        oauth_nonce: nonce,
        shopify_token: null,
      })
      .select('id')
      .single();

    if (insertError || !store) {
      console.error('shopify oauth init insert:', insertError);
      return NextResponse.json({ error: 'Failed to save store connection' }, { status: 500 });
    }

    const state = `${store.id}:${nonce}`;
    const authorizationUrl = buildAuthorizeUrl({
      shop: shopifyHost,
      clientId,
      redirectUri,
      state,
    });

    return NextResponse.json({
      authorizationUrl,
      storeId: store.id,
    });
  } catch (error) {
    console.error('shopify oauth init:', error);
    return NextResponse.json({ error: 'Failed to start Shopify connection' }, { status: 500 });
  }
}
