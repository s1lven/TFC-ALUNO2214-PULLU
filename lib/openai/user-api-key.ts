import { createServiceClient } from '@/lib/supabase/admin';

/**
 * Returns this user's saved OpenAI API key (server-side only).
 */
export async function resolveOpenAiApiKeyForUser(userId: string): Promise<string | null> {
  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from('user_openai_credentials')
      .select('api_key')
      .eq('user_id', userId)
      .maybeSingle();

    const userKey = data?.api_key?.trim();
    if (userKey) {
      return userKey;
    }
  } catch {
    // Missing service role or table not migrated yet
  }

  return null;
}
