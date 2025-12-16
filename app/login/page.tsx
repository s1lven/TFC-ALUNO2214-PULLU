"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        router.push("/dashboard");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkUser();
  }, [router]);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Error logging in with Google:', error.message);
        alert('Error starting Google login. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="text-gray-900 text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: '#F1F5F2' }}>
      {/* Left side - Brand */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#4BF364"></rect>
              <path d="M23.3902 11.3739C22.9829 7.21706 19.4282 4 15.0588 4C11.1708 4 7.91227 6.57364 6.96804 10.0727C6.81622 10.6402 6.23857 14.9308 5.73498 17.7141C5.17585 20.7974 4.60561 21.9794 4.50563 22.9373C4.4686 23.2987 4.61672 23.5879 4.87592 23.8048C5.13512 24.0217 5.5054 24.0578 5.87569 23.9132C7.27907 23.2301 8.70097 22.2469 9.71926 21.1444C9.89329 20.8986 10.1858 20.7359 10.5154 20.7359C10.8079 20.7359 11.0671 20.8625 11.2448 21.0613C11.3633 21.195 11.4559 21.4625 11.4818 21.6071C11.5485 22.0806 11.4226 22.5541 11.504 23.118C11.5781 23.5156 11.8373 23.8048 12.2076 23.9132C12.5038 24.0217 12.8741 23.9855 13.1703 23.8048C14.3738 23.1506 15.9067 21.0902 16.003 20.9926C16.1622 20.8335 16.3696 20.7359 16.6288 20.7359C16.8732 20.7359 17.1435 20.8299 17.3138 20.9781C17.3805 21.036 17.5212 21.2203 17.5841 21.3721C17.8396 21.8926 17.873 22.518 18.0581 23.1939C18.2062 23.7 18.6506 23.9892 19.1319 23.9892C19.4171 23.9892 19.6837 23.9024 19.8947 23.7108C21.9017 22.0408 24.0086 17.1574 23.3902 11.3739ZM14.096 15.3862C13.7628 15.6754 13.3925 15.82 13.0222 15.82C11.6151 15.82 10.9856 13.9765 11.0967 12.2053C11.1708 10.5787 11.8743 8.95211 13.0963 8.73523C13.1703 8.73523 13.2444 8.69908 13.3184 8.69908C14.4293 8.69908 15.5772 10.1088 15.5031 12.2053C15.4661 13.5066 14.9107 14.7356 14.096 15.3862ZM19.9466 15.3862C19.6133 15.6754 19.243 15.82 18.8727 15.82C17.4656 15.82 16.8362 13.9765 16.9472 12.2053C17.0213 10.5787 17.7248 8.95211 18.9468 8.73523C19.0209 8.73523 19.0949 8.69908 19.169 8.69908C20.2798 8.69908 21.4277 10.1088 21.3537 12.2053C21.3166 13.5066 20.7612 14.7356 19.9466 15.3862Z" fill="#10151E"></path>
            </svg>
            <h1 className="text-4xl font-league-spartan font-bold text-gray-900">
            voria
            </h1>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Streamline your<br />e-commerce workflow
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Import, translate, and manage your Shopify products with ease. One platform for all your product management needs.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Product Import</h3>
                <p className="text-gray-600 text-sm">Import single products or entire collections from any Shopify store</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AI Translation</h3>
                <p className="text-gray-600 text-sm">Translate products to 25+ languages with AI-powered accuracy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Seamless Integration</h3>
                <p className="text-gray-600 text-sm">Direct integration with your Shopify store</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 bg-white flex items-center justify-center p-12 border-l border-gray-200">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-gray-900 text-3xl font-bold mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600 text-base">
              Sign in to continue to your dashboard
            </p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-200 text-gray-900 py-3.5 px-4 rounded-lg flex items-center justify-center gap-3 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-gray-700 hover:text-gray-900 underline font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-gray-700 hover:text-gray-900 underline font-medium">
                Privacy Policy
              </a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account? It will be created automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
