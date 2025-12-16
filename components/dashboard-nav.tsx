'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

export default function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    // { href: '/dashboard', label: 'Home', icon: HomeIcon },
    // { href: '/dashboard/create-shot', label: 'Create Shot', icon: Sparkles },
    { href: '/dashboard/product-listing', label: 'Product Listing', icon: ShoppingBag },
  ]

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

