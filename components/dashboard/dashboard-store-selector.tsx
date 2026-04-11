'use client'

import Image from 'next/image'
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignFreeIcons } from '@hugeicons/core-free-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { storeDisplayLabel } from '@/lib/dashboard/store-display-label'
import type { ShopifyStore } from '@/types'

type Props = {
  stores: ShopifyStore[]
  selectedStore: ShopifyStore | null
  onSelectStore: (store: ShopifyStore) => void
  onAddStore: () => void
}

export function DashboardStoreSelector({ stores, selectedStore, onSelectStore, onAddStore }: Props) {
  return (
    <div className="fixed top-20 left-8 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2.5 text-sm transition-colors shadow-sm"
          >
            <Image src="/shopify.png" alt="Shopify" width={18} height={18} />
            <span className="font-medium text-green-700">
              {selectedStore ? storeDisplayLabel(selectedStore) : ''}
              {selectedStore?.connection_status === 'pending_oauth' ? (
                <span className="ml-2 text-xs font-normal text-amber-700">(authorize in Shopify)</span>
              ) : null}
            </span>
            <svg className="w-4 h-4 text-green-700 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={16}
          className="bg-white border-gray-200 min-w-[240px]"
        >
          {stores.map((store) => (
            <DropdownMenuItem
              key={store.id}
              onClick={() => onSelectStore(store)}
              className={`cursor-pointer px-3 py-2 focus:bg-gray-50 hover:bg-gray-50 ${
                selectedStore?.id === store.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 w-full">
                <Image src="/shopify.png" alt="Shopify" width={16} height={16} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate text-gray-900 hover:text-gray-900">
                    {storeDisplayLabel(store)}
                    {store.connection_status === 'pending_oauth' ? (
                      <span className="text-amber-600 text-xs ml-1">— pending</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500 truncate hover:text-gray-500">{store.shopify_store_url}</div>
                </div>
                {selectedStore?.id === store.id && (
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <div className="border-t border-gray-200 my-1" />
          <DropdownMenuItem
            onClick={onAddStore}
            className="cursor-pointer px-3 py-2 focus:bg-gray-50 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 w-full justify-center">
              <HugeiconsIcon icon={PlusSignFreeIcons} size={16} className="text-gray-900" />
              <span className="font-medium text-sm text-gray-900 hover:text-gray-900">Add Store</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
