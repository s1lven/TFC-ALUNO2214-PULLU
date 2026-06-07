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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`openai-key-get:${user.id}`, 30)) return jsonError('Too many requests. Please slow down.', 429);

    const admin = createServiceClient();
    const { data, error } = await admin
      .from('user_ai_credentials')
      .select('openai_key_last_four')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return jsonError('Could not load API key status', 500);
    }

    const configured = Boolean(data?.openai_key_last_four);
    return jsonOk({ configured, lastFour: configured ? data!.openai_key_last_four : null });
  } catch (e) {
    return jsonError('Server configuration error (service role or database).', 500);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`openai-key-post:${user.id}`, 10)) return jsonError('Too many requests. Please slow down.', 429);

    const body = await request.json().catch(() => null);
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!apiKey) return jsonError('API key is required', 400);
    if (apiKey.length > MAX_KEY_LENGTH) return jsonError('API key is too long', 400);

    const lastFour = maskLastFour(apiKey);
    const admin = createServiceClient();
    const { error } = await admin.from('user_ai_credentials').upsert(
      { user_id: user.id, openai_api_key: encrypt(apiKey), openai_key_last_four: lastFour, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

    if (error) {
      return jsonError('Could not save API key', 500);
    }

    return jsonSuccess({ lastFour });
  } catch (e) {
    return jsonError('Server configuration error (service role or database).', 500);
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`openai-key-delete:${user.id}`, 5)) return jsonError('Too many requests. Please slow down.', 429);

    const admin = createServiceClient();
    const { error } = await admin
      .from('user_ai_credentials')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      return jsonError('Could not remove API key', 500);
    }

    return jsonSuccess({});
  } catch (e) {
    return jsonError('Server configuration error (service role or database).', 500);
  }
}
