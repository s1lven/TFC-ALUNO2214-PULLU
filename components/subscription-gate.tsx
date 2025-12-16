'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasSubscription(false);
        setCheckingSubscription(false);
        return;
      }

      // Check subscriptions table - allow both active and trialing subscriptions
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('subscription_status', ['active', 'trialing'])
        .single();

      if (error || !subscription) {
        setHasSubscription(false);
      } else {
        setHasSubscription(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const priceId = billingCycle === 'monthly' 
        ? 'price_1SeN4WL00ORjNEQGY6OFLmiO' 
        : 'price_1SeN4WL00ORjNEQGZJESOp5I';

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  // Loading state
  if (checkingSubscription) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show plan selector if no subscription
  if (hasSubscription === false) {
    return (
      <div className="h-full flex items-center justify-center p-8" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="flex gap-8 items-start">
          {/* Left side - Main Card */}
          <div className="w-[420px]">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  7-Day Free Trial
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Start your 7-Day Free Trial</h1>
                <p className="text-gray-600 text-sm">Try 100% Free for 7 days. Cancel anytime</p>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative bg-gray-200 rounded-lg p-1 flex">
                  {/* Sliding background */}
                  <div
                    className="absolute top-1 bottom-1 bg-gray-900 rounded-md transition-all duration-300 ease-in-out"
                    style={{
                      left: billingCycle === 'monthly' ? '4px' : 'calc(50%)',
                      width: 'calc(50% - 4px)',
                    }}
                  />
                  
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`relative z-10 w-32 py-1.5 rounded-md font-medium text-sm transition-colors duration-300 flex items-center justify-center ${
                      billingCycle === 'monthly' 
                        ? 'text-white' 
                        : 'text-gray-700'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`relative z-10 w-32 py-1.5 rounded-md font-medium text-sm transition-colors duration-300 flex items-center justify-center gap-1.5 ${
                      billingCycle === 'annual' 
                        ? 'text-white' 
                        : 'text-gray-700'
                    }`}
                  >
                    Annual
                    <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-0.5 rounded leading-none">
                      -50%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Card */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 text-center mb-3">Pro Plan</h3>

                <div className="text-center mb-5">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? '29.99' : '14.99'}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  {billingCycle === 'annual' ? (
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-xs text-gray-500">
                        $179.99 billed annually
                      </p>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                        Save $180.00 / year
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Billed monthly
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#7cfc5c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">Import products with 1 click</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#7cfc5c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">Edit products before importing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#7cfc5c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">Translate products to any language</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#7cfc5c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">Improve product texts with AI</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#7cfc5c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">Connect unlimited stores</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#7cfc5c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">5000 credits per month</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#4CF365] text-white font-bold text-sm rounded-2xl hover:bg-[#3de056] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#5ffb78] shadow-lg hover:shadow-xl"
                  style={{
                    boxShadow: '0 4px 14px 0 rgba(76, 243, 101, 0.4), inset 0 -2px 8px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Steps */}
          <div className="flex-shrink-0 w-56">
            <div className="space-y-0">
              {/* Step 1 - Done */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                  <div className="w-px h-12 bg-gray-900 my-1.5"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Sign up</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Create your Voria account</p>
                </div>
              </div>

              {/* Step 2 - Current */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full border-2 border-gray-900 bg-white"></div>
                  <div className="w-px h-12 bg-gray-200 my-1.5"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Choose Subscription</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Pick your plan</p>
                </div>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-px h-12 bg-gray-200 my-1.5"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-400">Add your Store</h4>
                  <p className="text-xs text-gray-300 mt-0.5">Connect your Shopify</p>
                </div>
              </div>

              {/* Step 4 - Pending */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-400">Start Importing</h4>
                  <p className="text-xs text-gray-300 mt-0.5">Import your first product</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has subscription, show dashboard
  return <>{children}</>;
}
