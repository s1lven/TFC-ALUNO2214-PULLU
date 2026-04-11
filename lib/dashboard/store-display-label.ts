import type { ShopifyStore } from '@/types'

export function storeDisplayLabel(store: ShopifyStore): string {
  return (
    store.store_alias?.trim() ||
    store.store_name?.trim() ||
    store.shopify_store_url.replace('.myshopify.com', '')
  )
}
