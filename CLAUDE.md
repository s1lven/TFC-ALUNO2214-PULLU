## Description

A paltform for shopify store owners import products to their shopify stores, imported from another shopfiy stores

## Rules

* Shared shadcn-style primitives live in `components/ui/` (used by both marketing and dashboard). Dashboard-only UI: `components/dashboard/ui/` (e.g. `NotificationBanner`).
* Always use reusable components (no duplicated UI or logic)
* Always use colors from globals.css and tailwind.config.ts not hardcoded colors
* All user-facing notifications (success, error, info) must use `NotificationBanner` from `components/dashboard/ui/notification-banner.tsx` — never use `alert()`, `toast()`, or custom inline banners
* Icons from `lucide-react` for UI controls (including `NotificationBanner`)


DATABASE:
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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