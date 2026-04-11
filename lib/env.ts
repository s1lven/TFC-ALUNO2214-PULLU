export function envString(name: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") {
    throw new Error(
      `Missing required environment variable "${name}". Set it in .env.local or your deployment environment.`,
    );
  }
  return raw.trim();
}

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim() !== "") {
      return v.trim();
    }
  }
  return undefined;
}

/** Public anon / publishable key (Supabase dashboard → Project Settings → API). */
export function getSupabaseAnonKey(): string {
  const raw = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (raw === undefined) {
    throw new Error(
      'Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (or your host env), then restart the dev server. For production builds, these NEXT_PUBLIC_* variables must be present when you run `next build`.',
    );
  }
  return raw;
}

export function getSupabaseUrl(): string {
  const raw = firstNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (raw === undefined) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL. Add it in .env.local (project root) or your deployment environment, then restart the dev server. For production, set it when running `next build` so the client bundle can embed it, or pass credentials from a server component (see dashboard layout). Supabase: Project Settings → API.',
    );
  }
  return raw;
}

export function getSupabaseBrowserCredentials(): {
  url: string;
  anonKey: string;
} {
  return { url: getSupabaseUrl(), anonKey: getSupabaseAnonKey() };
}

export function hasSupabaseEnv(): boolean {
  const url = firstNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return url !== undefined && key !== undefined;
}
