'use client'

import { Sparkles, ImageIcon, Palette } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Voria</h1>
          <p className="text-neutral-400">Create stunning fashion shots with AI</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <ImageIcon className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Create Shot</h3>
            <p className="text-xs text-neutral-400">Generate product shots</p>
          </div>
          <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <Palette className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Product Pictures</h3>
            <p className="text-xs text-neutral-400">Advanced customization</p>
          </div>
        </div>

        <p className="text-sm text-neutral-500">
          Choose a tool from the sidebar to get started
        </p>
      </div>
    </div>
  );
}
