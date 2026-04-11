import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/http';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  buildAuthorizeUrl,
  generateOAuthNonce,
  getOAuthRedirectUri,
  normalizeShopifyHost,
} from '@/lib/shopify/oauth';
import { resolvePublicAppBaseUrl } from '@/lib/shopify/public-app-url';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`oauth-init:${user.id}`, 10)) return jsonError('Too many requests. Please slow down.', 429);

    const body = await request.json();
    const shopSubdomain = typeof body.shop_subdomain === 'string' ? body.shop_subdomain : '';
    const storeAlias = typeof body.store_alias === 'string' ? body.store_alias.trim() : '';
    const clientId = typeof body.client_id === 'string' ? body.client_id.trim() : '';
    const clientSecret = typeof body.client_secret === 'string' ? body.client_secret.trim() : '';

    if (!shopSubdomain || !storeAlias || !clientId || !clientSecret) {
      return jsonError('Domain, alias, client ID, and client secret are required', 400);
    }

    let shopifyHost: string;
    try {
      shopifyHost = normalizeShopifyHost(
        shopSubdomain.includes('.myshopify.com') ? shopSubdomain : `${shopSubdomain}.myshopify.com`
      );
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : 'Invalid shop domain', 400);
    }

    const appBase = resolvePublicAppBaseUrl(request);
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
      return jsonError('Failed to save store connection', 500);
    }

    const state = `${store.id}:${nonce}`;
    const authorizationUrl = buildAuthorizeUrl({ shop: shopifyHost, clientId, redirectUri, state });

    return jsonOk({ authorizationUrl, storeId: store.id });
  } catch (error) {
    return jsonError('Failed to start Shopify connection', 500);
  }
}
