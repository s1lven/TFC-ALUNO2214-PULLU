import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FRANKFURTER_CURRENCIES } from '@/lib/pricing/adjust-collection-prices';
import { jsonError, jsonOk } from '@/lib/api/http';
import { checkRateLimit } from '@/lib/rate-limit';

const ALLOWED = new Set(FRANKFURTER_CURRENCIES.map((c) => c.code));

/** ECB-based free API, no key: https://frankfurter.app */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`exchange-rates:${user.id}`, 60)) return jsonError('Too many requests. Please slow down.', 429);

    const body = await request.json().catch(() => ({}));
    const from = typeof body.from === 'string' ? body.from.toUpperCase().trim() : '';
    const to = typeof body.to === 'string' ? body.to.toUpperCase().trim() : '';

    if (!from || !to || !ALLOWED.has(from) || !ALLOWED.has(to)) {
      return jsonError('Invalid or unsupported currency', 400);
    }

    if (from === to) {
      return jsonOk({ from, to, rate: 1, date: new Date().toISOString().slice(0, 10) });
    }

    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      return jsonError(`Exchange rate service error: ${res.status} — ${text.slice(0, 200)}`, 502);
    }

    const data = (await res.json()) as { rates?: Record<string, number>; date?: string };
    const rate = data.rates?.[to];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      return jsonError('Rate not available for this pair', 502);
    }

    return jsonOk({ from, to, rate, date: data.date ?? null });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to fetch exchange rate', 500);
  }
}
