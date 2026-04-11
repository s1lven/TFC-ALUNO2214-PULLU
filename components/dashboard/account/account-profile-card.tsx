'use client'

import type { User } from '@supabase/supabase-js'

export function AccountProfileCard({ user }: { user: User | null }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{user?.email?.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-900 font-medium mb-1">{user?.email}</p>
          <p className="text-sm text-gray-500">
            {user?.created_at ? (
              <>
                Member since{' '}
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </>
            ) : (
              'Member'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
