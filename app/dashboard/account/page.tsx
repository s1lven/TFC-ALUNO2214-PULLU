'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-8" style={{ backgroundColor: '#F1F5F2' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h1>
          <p className="text-gray-600 text-sm">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-1">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {user?.created_at ? (
                  <>Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}</>
                ) : (
                  'Member'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Subscription</h2>
          
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">Free Plan</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
              </div>
              <p className="text-sm text-gray-600">Perfect for getting started</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$0</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Includes</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Product import from Shopify stores
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI-powered translation & enhancement
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Collection import
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Multiple store management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
