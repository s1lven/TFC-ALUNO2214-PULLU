'use client'

import { PulluWordmark } from '@/components/web/pullu-brand'
import {
  DashboardUserMenu,
  type DashboardUserMenuProps,
} from '@/components/dashboard/dashboard-user-menu'

export type DashboardTopBarProps = DashboardUserMenuProps

export function DashboardTopBar({
  userName,
  userEmail,
  userAvatar,
  supabaseBrowser,
}: DashboardTopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <PulluWordmark
          href="/"
          className="flex items-center gap-3"
          markSize={28}
          wordmarkClassName="text-3xl font-league-spartan font-bold text-gray-900"
        />

        <div className="flex items-center">
          <DashboardUserMenu
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            supabaseBrowser={supabaseBrowser}
          />
        </div>
      </div>
    </div>
  )
}
