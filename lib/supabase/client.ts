import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

/** When provided (e.g. from a Server Component), avoids relying on client-inlined NEXT_PUBLIC_* at build time. */
export type SupabaseBrowserConfig = {
  url: string;
  anonKey: string;
};

export function createClient(config?: SupabaseBrowserConfig) {
  const url = config?.url ?? getSupabaseUrl();
  const anonKey = config?.anonKey ?? getSupabaseAnonKey();
  return createBrowserClient(url, anonKey);
}
