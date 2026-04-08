import crypto from 'crypto';
import { SHOPIFY_SCOPES_DOCUMENTATION } from '@/lib/shopify/scopes';

/** Scopes required for product import, collections, and publishing. */
export const SHOPIFY_API_SCOPES = SHOPIFY_SCOPES_DOCUMENTATION;

const SHOP_HOST_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

export function normalizeShopifyHost(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '');
  s = s.split('/')[0] ?? s;
  s = s.split(':')[0] ?? s;
  if (!s.endsWith('.myshopify.com')) {
    s = `${s.replace(/\.myshopify\.com$/i, '')}.myshopify.com`;
  }
  if (!SHOP_HOST_REGEX.test(s)) {
    throw new Error('Invalid Shopify domain. Example: your-store.myshopify.com');
  }
  return s;
}

export function generateOAuthNonce(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Validates Shopify OAuth callback HMAC (authorization code grant).
 * @see https://shopify.dev/docs/apps/auth/oauth
 */
export function verifyOAuthHmac(searchParams: URLSearchParams, clientSecret: string): boolean {
  const hmac = searchParams.get('hmac');
  if (!hmac) return false;

  const pairs: [string, string][] = [];
  searchParams.forEach((value, key) => {
    if (key === 'hmac' || key === 'signature') return;
    pairs.push([key, value]);
  });
  pairs.sort((a, b) => a[0].localeCompare(b[0]));
  const message = pairs.map(([k, v]) => `${k}=${v}`).join('&');

  const digest = crypto.createHmac('sha256', clientSecret).update(message).digest('hex');
  try {
    const a = Buffer.from(digest, 'utf8');
    const b = Buffer.from(hmac, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function validateShopHostname(shop: string): boolean {
  return SHOP_HOST_REGEX.test(shop);
}

export function buildAuthorizeUrl(params: {
  shop: string;
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string;
}): string {
  const u = new URL(`https://${params.shop}/admin/oauth/authorize`);
  u.searchParams.set('client_id', params.clientId);
  u.searchParams.set('scope', params.scopes ?? SHOPIFY_API_SCOPES);
  u.searchParams.set('redirect_uri', params.redirectUri);
  u.searchParams.set('state', params.state);
  return u.toString();
}

export async function exchangeCodeForToken(
  shop: string,
  clientId: string,
  clientSecret: string,
  code: string
): Promise<{ access_token: string; scope?: string }> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<{ access_token: string; scope?: string }>;
}

export function getOAuthRedirectUri(appBaseUrl: string): string {
  const base = appBaseUrl.replace(/\/$/, '');
  return `${base}/api/shopify/oauth/callback`;
}
