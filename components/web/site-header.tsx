'use client'

import { League_Spartan } from "next/font/google"
import Link from 'next/link'
import { PulluWordmark } from '@/components/web/pullu-brand'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["700"],
})

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = `/#${sectionId}`
    }
  }

  return (
    <header className={`w-full z-50 sticky top-0 transition-all duration-300 ${
      isScrolled ? 'px-4 sm:px-6 lg:px-8' : 'px-0'
    }`}>
      <div 
        className={`mx-auto max-w-7xl ${isScrolled ? 'bg-white/90 border border-gray-200 shadow-lg' : 'bg-surface'}`}
        style={{
          marginTop: isScrolled ? '1rem' : '0',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderRadius: isScrolled ? '1rem' : '0',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className={`px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}>
          <PulluWordmark
            href="/"
            className="flex items-center gap-2 cursor-pointer"
            wordmarkClassName={`text-2xl font-bold text-gray-900 ${leagueSpartan.className}`}
          />
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer">Get started</Link>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
            >
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer">FAQ&apos;s</button>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button 
                type="button"
                className="px-4 py-2 bg-brand hover:bg-brand-hover transition-all text-gray-900 font-semibold text-sm rounded-lg shadow-sm"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.umami) {
                    window.umami.track('dashboard-button-click', { location: 'header' });
                  }
                  window.location.href = '/dashboard';
                }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  type="button"
                  className="hidden sm:block px-4 py-2 bg-transparent hover:bg-gray-50 transition-all text-gray-900 font-medium text-sm rounded-lg"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.umami) {
                      window.umami.track('signin-button-click', { location: 'header' });
                    }
                    window.location.href = '/auth/login';
                  }}
                >
                  Log in
                </button>
                <button 
                  type="button"
                  className="px-4 py-2 bg-brand hover:bg-brand-hover transition-all text-gray-900 font-semibold text-sm rounded-lg shadow-sm"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.umami) {
                      window.umami.track('signup-button-click', { location: 'header' });
                    }
                    window.location.href = '/auth/login';
                  }}
                >
                  Try it free
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
