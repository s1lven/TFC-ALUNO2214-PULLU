// Common types used across the application

export interface ShopifyStore {
  id: number;
  user_id: string;
  shopify_store_url: string;
  /** Present on the server; omitted from /api/get-stores for security. */
  shopify_token?: string | null;
  store_name?: string | null;
  store_alias?: string | null;
  /** pending_oauth = waiting for merchant to approve in Shopify; connected = ready */
  connection_status?: string | null;
  shopify_client_id?: string | null;
  created_at: string;
}

export interface Product {
  id?: string;
  title: string;
  handle?: string;
  description?: string;
  price?: string;
  compareAtPrice?: string;
  images?: string[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  [key: string]: unknown;
}

export interface ProductVariant {
  id?: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity?: number;
  [key: string]: unknown;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  [key: string]: unknown;
}
