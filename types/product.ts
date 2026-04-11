export interface Product {
  id?: string
  title: string
  handle?: string
  description?: string
  price?: string
  compareAtPrice?: string
  images?: string[]
  variants?: ProductVariant[]
  options?: ProductOption[]
  [key: string]: unknown
}

export interface ProductVariant {
  id?: string
  title: string
  price: string
  compareAtPrice?: string
  sku?: string
  inventoryQuantity?: number
  [key: string]: unknown
}

export interface ProductOption {
  name: string
  values: string[]
}

export interface Collection {
  id: string
  title: string
  handle: string
  [key: string]: unknown
}
