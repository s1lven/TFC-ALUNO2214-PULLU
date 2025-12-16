'use client'

import { useState } from 'react'
import { MoreHorizontal, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface DashboardUserMenuProps {
  userName: string
  userEmail: string
  userAvatar?: string | null
}

export default function DashboardUserMenu({ userName, userEmail, userAvatar }: DashboardUserMenuProps) {
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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
      >
        {/* Profile Picture */}
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
        
        {/* User Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {userEmail}
          </p>
        </div>
        
        {/* More Options */}
        <MoreHorizontal size={16} className="text-gray-600 flex-shrink-0" />
        </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded shadow-md z-20 overflow-hidden min-w-[180px] py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard/account')
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
            >
              <User size={15} className="text-gray-600" />
              <span className="text-sm text-gray-700">Account</span>
            </button>
            <div className="h-px bg-gray-200 my-0.5" />
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut size={15} className="text-red-500" />
              <span className="text-sm text-red-600">Log out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

