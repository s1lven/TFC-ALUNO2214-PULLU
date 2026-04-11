'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { LogoutFreeIcons, MoreHorizontalFreeIcons, UserFreeIcons } from '@hugeicons/core-free-icons';
import {
  createClient,
  type SupabaseBrowserConfig,
} from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export type DashboardUserMenuProps = {
  userName: string
  userEmail: string
  userAvatar?: string | null
  supabaseBrowser: SupabaseBrowserConfig
}

export function DashboardUserMenu({
  userName,
  userEmail,
  userAvatar,
  supabaseBrowser,
}: DashboardUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient(supabaseBrowser)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
      >
        {userAvatar ? (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={userAvatar}
              alt={userName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>

        <HugeiconsIcon icon={MoreHorizontalFreeIcons} size={16} className="flex-shrink-0 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden />

          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded shadow-md z-20 overflow-hidden min-w-[180px] py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard/account')
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
            >
              <HugeiconsIcon icon={UserFreeIcons} size={15} className="text-gray-600" />
              <span className="text-sm text-gray-700">Account</span>
            </button>
            <div className="h-px bg-gray-200 my-0.5" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 transition-colors text-left"
            >
              <HugeiconsIcon icon={LogoutFreeIcons} size={15} className="text-red-500" />
              <span className="text-sm text-red-600">Log out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
