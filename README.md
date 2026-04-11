# Pullu

Import products from any Shopify store into your own — with translation, price adjustment, and direct Shopify Admin API push.

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **Supabase** — auth (magic link + Google OAuth) and database
- **Shopify Admin API** — REST + GraphQL (OAuth custom app)
- **OpenAI** — translation (user API key stored server-side)
- **FAL.ai** — optional AI product shots (`FAL_API_KEY`)

### Repo layout (short)

- `app/` — routes (marketing, dashboard, API handlers)
- `components/ui/` — shared primitives (shadcn-style); `components/web/` — landing/auth; `components/dashboard/` — app UI
- `lib/` — Supabase, Shopify, scraping, rate limiting, etc.
- `tests/` — Vitest suites (`tests/api/*`, `tests/lib/*`)

---

## Running locally

### 1. Clone and install

```bash
git clone <repo-url>
cd pullu
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then run the following SQL in the **SQL editor**:

```sql
CREATE TABLE public.shopify_stores (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid DEFAULT auth.uid(),
  shopify_store_url text,
  shopify_token text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  store_name text,
  store_alias text,
  shopify_client_id text,
  shopify_client_secret text,
  connection_status text NOT NULL DEFAULT 'connected'::text,
  oauth_nonce text,
  CONSTRAINT shopify_stores_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.user_openai_credentials (
  user_id uuid NOT NULL,
  api_key text NOT NULL,
  key_last_four text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_openai_credentials_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_openai_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

Then enable **Row Level Security** on both tables and add the following policies:

```sql
-- shopify_stores: users can only see and modify their own rows
ALTER TABLE public.shopify_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own stores"
ON public.shopify_stores
FOR ALL USING (auth.uid() = user_id);

-- user_openai_credentials: users can only see and modify their own row
ALTER TABLE public.user_openai_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own credentials"
ON public.user_openai_credentials
FOR ALL USING (auth.uid() = user_id);
```

### 3. Enable Google OAuth (optional)

In Supabase → **Authentication → Providers**, enable Google and add your Google OAuth client ID and secret. Add `https://<your-domain>/auth/callback` as an authorised redirect URI in the Google Cloud Console.

### 4. Set up environment variables

Copy `.env.example` to `.env.local` and fill in values. Supabase keys are under **Project Settings → API**.

- Use **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`** or **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (either name works; see `lib/env.ts`).
- **`NEXT_PUBLIC_APP_URL`** must match how you open the app (e.g. `http://localhost:3000`) so Shopify OAuth redirects stay correct.
- Optional: **`FAL_API_KEY`** (AI shots), **`SHOPIFY_OAUTH_REDIRECT_URI`** if the callback URL cannot be derived from the app URL.

> **`SUPABASE_SERVICE_ROLE_KEY`** is server-only (OpenAI key storage, account deletion, etc.) — never expose it to the client.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Tests and types

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run test        # Vitest (API + lib unit tests)
```

---

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the same variables as in `.env.example` in Vercel, with **`NEXT_PUBLIC_APP_URL`** set to your production origin (no trailing slash)
4. Deploy — Vercel handles the build automatically

---

## Deploy to a VPS

```bash
# On your server (Node 20+ recommended)
git clone <repo-url> && cd <repo-folder>
npm ci
npm run build

# Env vars — mirror .env.example (publishable/anon key, service role, app URL, etc.)
export NEXT_PUBLIC_SUPABASE_URL=...
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...
export SUPABASE_SERVICE_ROLE_KEY=...
export NEXT_PUBLIC_APP_URL=https://yourdomain.com

npm start
```

Run behind a reverse proxy (nginx or Caddy) pointing to port `3000`. Make sure your `NEXT_PUBLIC_APP_URL` matches the public domain exactly, as Shopify uses it for OAuth redirects.
