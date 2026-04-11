export interface ShopifyStore {
  id: number
  user_id: string
  shopify_store_url: string
  /** Present on the server; omitted from /api/get-stores for security. */
  shopify_token?: string | null
  store_name?: string | null
  store_alias?: string | null
  /** pending_oauth = waiting for merchant to approve in Shopify; connected = ready */
  connection_status?: string | null
  shopify_client_id?: string | null
  created_at: string
}
