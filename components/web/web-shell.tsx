import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/web/site-footer'
import { SiteHeader } from '@/components/web/site-header'

export function WebShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col bg-surface">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  )
}
