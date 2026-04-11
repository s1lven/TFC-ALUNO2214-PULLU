'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { safePostAuthPath } from '@/lib/auth/safe-post-auth-path'
import { PulluWordmark } from '@/components/web/pullu-brand'
import { LoginForm } from '@/components/web/auth/login-form'
import { AuthPanelAlert } from '@/components/web/auth/auth-panel-alert'

export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const postAuthPath = safePostAuthPath(searchParams.get('next'))

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.push(postAuthPath)
      } else {
        setIsCheckingAuth(false)
      }
    }

    void checkUser()
  }, [router, postAuthPath])

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const next = encodeURIComponent(postAuthPath)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        },
      })

      if (error) {
        console.error('Error logging in with Google:', error.message)
        setAuthError('Error starting Google login. Please try again.')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setAuthError('Unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-surface">
        <div className="text-gray-900 text-lg">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="mb-8">
            <PulluWordmark
              href="/"
              className="flex items-center gap-3"
              markSize={40}
              wordmarkClassName="text-4xl font-league-spartan font-bold text-gray-900"
            />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Streamline your
            <br />
            e-commerce workflow
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Import, translate, and manage your Shopify products with ease. One platform for all your product management needs.
          </p>

          <div className="space-y-4">
            {[
              ['Product Import', 'Import single products or entire collections from any Shopify store'],
              ['AI Translation', 'Translate products to 25+ languages with AI-powered accuracy'],
              ['Seamless Integration', 'Direct integration with your Shopify store'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center p-12 border-l border-gray-200 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="mb-9">
            <div className="w-8 h-1 rounded-full bg-brand mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {authError ? (
            <div className="mb-6">
              <AuthPanelAlert variant="error" onDismiss={() => setAuthError(null)}>
                {authError}
              </AuthPanelAlert>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <LoginForm embedded className="gap-0" postAuthPath={postAuthPath} />

          <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
