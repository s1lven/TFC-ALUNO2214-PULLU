import { createServiceClient } from '@/lib/supabase/admin';
import { decrypt } from '@/lib/crypto';

export async function resolveFalApiKeyForUser(userId: string): Promise<string | null> {
  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from('user_ai_credentials')
      .select('falai_api_key')
      .eq('user_id', userId)
      .maybeSingle();

    const userKey = data?.falai_api_key?.trim();
    if (userKey) return decrypt(userKey);
  } catch {
    // Missing service role or table not migrated yet
  }

  return null;
}
