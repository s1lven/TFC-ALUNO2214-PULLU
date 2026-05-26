import { createClient } from '@/lib/supabase/server';
import { jsonError, jsonOk } from '@/lib/api/http';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`get-stores:${user.id}`, 120)) return jsonError('Too many requests. Please slow down.', 429);

    const { data: stores, error: storesError } = await supabase
      .from('shopify_stores')
      .select('id, user_id, shopify_store_url, store_name, store_alias, connection_status, shopify_client_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (storesError) {
      return jsonError('Failed to fetch stores', 500);
    }

    return jsonOk({ stores: stores || [] });
  } catch (error) {
    return jsonError('Failed to fetch stores', 500);
  }
}
