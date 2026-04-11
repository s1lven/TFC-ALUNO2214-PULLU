import { jsonError, jsonSuccess } from '@/lib/api/http';
import { createServiceClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`account-delete:${user.id}`, 3)) return jsonError('Too many requests. Please slow down.', 429);

    const body = await request.json().catch(() => null);
    const confirmation =
      typeof body?.confirmation === 'string' ? body.confirmation.trim() : '';
    if (confirmation !== 'delete') {
      return jsonError('Type the word delete to confirm.', 400);
    }

    const admin = createServiceClient();

    const { error: openaiErr } = await admin
      .from('user_openai_credentials')
      .delete()
      .eq('user_id', user.id);
    if (openaiErr) {
      return jsonError('Could not remove account data.', 500);
    }

    const { error: storesErr } = await admin
      .from('shopify_stores')
      .delete()
      .eq('user_id', user.id);
    if (storesErr) {
      return jsonError('Could not remove account data.', 500);
    }

    const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
    if (authErr) {
      return jsonError('Could not delete your account. Try again or contact support.', 500);
    }

    return jsonSuccess({});
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('SUPABASE_SERVICE_ROLE_KEY') || msg.includes('Missing')) {
      return jsonError(
        'Account deletion is not available (server configuration).',
        503,
      );
    }
    return jsonError('Something went wrong.', 500);
  }
}
