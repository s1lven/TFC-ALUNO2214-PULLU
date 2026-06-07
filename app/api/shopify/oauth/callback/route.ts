import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  exchangeCodeForToken,
  validateShopHostname,
  verifyOAuthHmac,
} from '@/lib/shopify/oauth';
import { resolvePublicAppBaseUrl } from '@/lib/shopify/public-app-url';
import { devLog } from '@/lib/logger';
import { decrypt, encrypt } from '@/lib/crypto';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const searchParams = url.searchParams;
  const appBase = resolvePublicAppBaseUrl(request);

  const redirectDashboard = (params: Record<string, string>) => {
    const u = new URL('/dashboard', appBase);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    return NextResponse.redirect(u);
  };

  try {
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const state = searchParams.get('state');

    if (!code || !shop || !state) {
      return redirectDashboard({
        shopify_error: 'missing_params',
        shopify_message: 'OAuth callback was missing code, shop, or state.',
      });
    }

    if (!validateShopHostname(shop)) {
      return redirectDashboard({
        shopify_error: 'invalid_shop',
        shopify_message: 'Invalid shop hostname returned by Shopify.',
      });
    }

    const stateParts = state.split(':');
    if (stateParts.length !== 2) {
      return redirectDashboard({
        shopify_error: 'invalid_state',
        shopify_message: 'Invalid OAuth state.',
      });
    }
    const storeId = parseInt(stateParts[0], 10);
    const nonce = stateParts[1];
    if (!Number.isFinite(storeId) || !nonce) {
      return redirectDashboard({
        shopify_error: 'invalid_state',
        shopify_message: 'Invalid OAuth state format.',
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select(
        'id, user_id, shopify_store_url, shopify_client_id, shopify_client_secret, oauth_nonce, connection_status'
      )
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return redirectDashboard({
        shopify_error: 'store_not_found',
        shopify_message: 'Store record not found. Start the connection again from the dashboard.',
      });
    }

    if (!user || store.user_id !== user.id) {
      return redirectDashboard({
        shopify_error: 'session',
        shopify_message: 'Sign in to the same Pullu account that started this connection, then try again.',
      });
    }

    if (store.shopify_store_url !== shop) {
      return redirectDashboard({
        shopify_error: 'shop_mismatch',
        shopify_message: 'Shop did not match the store you started connecting.',
      });
    }

    if (store.connection_status !== 'pending_oauth' || !store.oauth_nonce || store.oauth_nonce !== nonce) {
      return redirectDashboard({
        shopify_error: 'invalid_session',
        shopify_message: 'OAuth session expired or already completed. Add the store again.',
      });
    }

    const clientSecret = decrypt(store.shopify_client_secret as string);
    if (!verifyOAuthHmac(searchParams, clientSecret)) {
      return redirectDashboard({
        shopify_error: 'invalid_hmac',
        shopify_message: 'Could not verify request from Shopify.',
      });
    }

    const tokenRes = await exchangeCodeForToken(
      shop,
      store.shopify_client_id as string,
      clientSecret,
      code
    );

    const accessToken = tokenRes.access_token;
    if (!accessToken) {
      return redirectDashboard({
        shopify_error: 'no_token',
        shopify_message: 'Shopify did not return an access token.',
      });
    }

    let shopName: string | null = null;
    try {
      const shopRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
        headers: { 'X-Shopify-Access-Token': accessToken },
      });
      if (shopRes.ok) {
        const shopJson = (await shopRes.json()) as { shop?: { name?: string } };
        shopName = shopJson.shop?.name ?? null;
      }
    } catch (e) {
      devLog(
        'shop.json fetch in OAuth callback failed:',
        e instanceof Error ? e.message : e,
      );
    }

    const { error: updateError } = await supabase
      .from('shopify_stores')
      .update({
        shopify_token: encrypt(accessToken),
        connection_status: 'connected',
        oauth_nonce: null,
        store_name: shopName || undefined,
      })
      .eq('id', storeId)
      .eq('user_id', user.id);

    if (updateError) {
      return redirectDashboard({
        shopify_error: 'db_error',
        shopify_message: 'Token received but saving failed. Try again.',
      });
    }

    return redirectDashboard({ shopify_connected: '1' });
  } catch (error) {
    return redirectDashboard({
      shopify_error: 'unexpected',
      shopify_message: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
}
