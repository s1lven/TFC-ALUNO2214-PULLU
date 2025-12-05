'use client'

import { useState } from 'react'
import { MoreHorizontal, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardUserMenuProps {
  userName: string
  userEmail: string
}

export default function DashboardUserMenu({ userName, userEmail }: DashboardUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Profile Picture */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {userName.charAt(0).toUpperCase()}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {userEmail}
          </p>
        </div>
        
        {/* More Options */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-white/50 rounded-md transition-colors"
        >
          <MoreHorizontal size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut size={16} className="text-red-500" />
              <span className="text-sm text-gray-900">Log out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

