import { Suspense } from 'react'
import { LoginScreen } from '@/components/web/auth/login-screen'

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-surface text-gray-900">
          Loading…
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  )
}
