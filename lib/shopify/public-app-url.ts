import type { NextRequest } from 'next/server';

/**
 * Canonical public origin for OAuth redirects and callback URLs.
 * Prefer env in Vercel (NEXT_PUBLIC_APP_URL or SHOPIFY_APP_URL); otherwise use
 * the incoming request (Host / X-Forwarded-*) so production never falls back to localhost.
 */
export function resolvePublicAppBaseUrl(request: NextRequest): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.SHOPIFY_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const hostHeader =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  const host = hostHeader?.split(',')[0]?.trim();
  if (host) {
    let proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    if (!proto) {
      proto = request.nextUrl.protocol === 'https:' ? 'https' : 'http';
    }
    return `${proto}://${host}`.replace(/\/$/, '');
  }

  const origin = request.nextUrl.origin;
  if (origin) {
    return origin.replace(/\/$/, '');
  }

  return 'http://localhost:3001';
}
