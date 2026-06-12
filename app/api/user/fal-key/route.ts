import { jsonError, jsonOk, jsonSuccess } from '@/lib/api/http';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { encrypt } from '@/lib/crypto';

const MAX_KEY_LENGTH = 512;

function maskLastFour(secret: string): string {
  const t = secret.trim();
  if (t.length === 0) return '****';
  if (t.length <= 4) return '••••';
  return t.slice(-4);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`fal-key-get:${user.id}`, 30)) return jsonError('Too many requests. Please slow down.', 429);

    const admin = createServiceClient();
    const { data } = await admin
      .from('user_ai_credentials')
      .select('falai_key_last_four')
      .eq('user_id', user.id)
      .maybeSingle();

    const configured = Boolean(data?.falai_key_last_four);
    return jsonOk({ configured, lastFour: configured ? data!.falai_key_last_four : null });
  } catch {
    return jsonError('Server configuration error (service role or database).', 500);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`fal-key-post:${user.id}`, 10)) return jsonError('Too many requests. Please slow down.', 429);

    const body = await request.json().catch(() => null);
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!apiKey) return jsonError('API key is required', 400);
    if (apiKey.length > MAX_KEY_LENGTH) return jsonError('API key is too long', 400);

    const lastFour = maskLastFour(apiKey);
    const admin = createServiceClient();
    const { error } = await admin.from('user_ai_credentials').upsert(
      { user_id: user.id, falai_api_key: encrypt(apiKey), falai_key_last_four: lastFour, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

    if (error) return jsonError('Could not save API key', 500);

    return jsonSuccess({ lastFour });
  } catch {
    return jsonError('Server configuration error (service role or database).', 500);
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`fal-key-delete:${user.id}`, 5)) return jsonError('Too many requests. Please slow down.', 429);

    const admin = createServiceClient();
    const { error } = await admin
      .from('user_ai_credentials')
      .update({ falai_api_key: null, falai_key_last_four: null, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) return jsonError('Could not remove API key', 500);

    return jsonSuccess({});
  } catch {
    return jsonError('Server configuration error (service role or database).', 500);
  }
}
