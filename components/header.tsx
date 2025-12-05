'use client'

import { League_Spartan } from "next/font/google"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["700"],
})

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll detection
  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
    }

    // Set initial state
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  // Handle auth detection
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    // Listen for auth changes
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
        className="mx-auto max-w-7xl"
        style={{
          marginTop: isScrolled ? '1rem' : '0',
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : '#F1F5F2',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderRadius: isScrolled ? '1rem' : '0',
          boxShadow: isScrolled ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
          border: isScrolled ? '1px solid rgb(229, 231, 235)' : 'none',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className={`px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}>
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#4BF364"></rect>
              <path d="M23.3902 11.3739C22.9829 7.21706 19.4282 4 15.0588 4C11.1708 4 7.91227 6.57364 6.96804 10.0727C6.81622 10.6402 6.23857 14.9308 5.73498 17.7141C5.17585 20.7974 4.60561 21.9794 4.50563 22.9373C4.4686 23.2987 4.61672 23.5879 4.87592 23.8048C5.13512 24.0217 5.5054 24.0578 5.87569 23.9132C7.27907 23.2301 8.70097 22.2469 9.71926 21.1444C9.89329 20.8986 10.1858 20.7359 10.5154 20.7359C10.8079 20.7359 11.0671 20.8625 11.2448 21.0613C11.3633 21.195 11.4559 21.4625 11.4818 21.6071C11.5485 22.0806 11.4226 22.5541 11.504 23.118C11.5781 23.5156 11.8373 23.8048 12.2076 23.9132C12.5038 24.0217 12.8741 23.9855 13.1703 23.8048C14.3738 23.1506 15.9067 21.0902 16.003 20.9926C16.1622 20.8335 16.3696 20.7359 16.6288 20.7359C16.8732 20.7359 17.1435 20.8299 17.3138 20.9781C17.3805 21.036 17.5212 21.2203 17.5841 21.3721C17.8396 21.8926 17.873 22.518 18.0581 23.1939C18.2062 23.7 18.6506 23.9892 19.1319 23.9892C19.4171 23.9892 19.6837 23.9024 19.8947 23.7108C21.9017 22.0408 24.0086 17.1574 23.3902 11.3739ZM14.096 15.3862C13.7628 15.6754 13.3925 15.82 13.0222 15.82C11.6151 15.82 10.9856 13.9765 11.0967 12.2053C11.1708 10.5787 11.8743 8.95211 13.0963 8.73523C13.1703 8.73523 13.2444 8.69908 13.3184 8.69908C14.4293 8.69908 15.5772 10.1088 15.5031 12.2053C15.4661 13.5066 14.9107 14.7356 14.096 15.3862ZM19.9466 15.3862C19.6133 15.6754 19.243 15.82 18.8727 15.82C17.4656 15.82 16.8362 13.9765 16.9472 12.2053C17.0213 10.5787 17.7248 8.95211 18.9468 8.73523C19.0209 8.73523 19.0949 8.69908 19.169 8.69908C20.2798 8.69908 21.4277 10.1088 21.3537 12.2053C21.3166 13.5066 20.7612 14.7356 19.9466 15.3862Z" fill="#10151E"></path>
            </svg>
            <div className={`text-2xl font-bold text-gray-900 ${leagueSpartan.className}`}>voria</div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('blog')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer">Blog</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer">FAQ's</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer">Contact</button>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button 
                className="px-4 py-2 bg-[#7cfc5c] hover:bg-[#6ee84e] transition-all text-gray-900 font-semibold text-sm rounded-lg shadow-sm"
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
                  className="hidden sm:block px-4 py-2 bg-transparent hover:bg-gray-50 transition-all text-gray-900 font-medium text-sm rounded-lg"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.umami) {
                      window.umami.track('signin-button-click', { location: 'header' });
                    }
                    window.location.href = '/login';
                  }}
                >
                  Log in
                </button>
                <button 
                  className="px-4 py-2 bg-[#7cfc5c] hover:bg-[#6ee84e] transition-all text-gray-900 font-semibold text-sm rounded-lg shadow-sm" 
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.umami) {
                      window.umami.track('signup-button-click', { location: 'header' });
                    }
                    window.location.href = '/login';
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
