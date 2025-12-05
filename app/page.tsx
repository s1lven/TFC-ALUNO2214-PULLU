'use client'
// import { useState, useEffect } from 'react';
import Header from "@/components/header";
import { Link } from "lucide-react";

// const notifications = [
//   { id: 1, order: '#1001', price: '59,95 €', item: '1 Item from store - Your store' },
//   { id: 2, order: '#1002', price: '124,50 €', item: '2 Items from store - Your store' },
// ];

export default function Home() {
  // const [visibleNotifications, setVisibleNotifications] = useState<number[]>([]);
  // const [cycle, setCycle] = useState(0);

  // useEffect(() => {
  //   const showNotifications = () => {
  //     // Show first notification after 2s
  //     setTimeout(() => {
  //       setVisibleNotifications([1]);
  //     }, 2000);

  //     // Show second notification after 5s (stacks with first)
  //     setTimeout(() => {
  //       setVisibleNotifications([1, 2]);
  //     }, 5000);

  //     // Clear all and restart cycle after 9s
  //     setTimeout(() => {
  //       setVisibleNotifications([]);
  //       setCycle((prev) => prev + 1);
  //     }, 9000);
  //   };

  //   showNotifications();
  // }, [cycle]);

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F1F5F2' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="flex-1 w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-900 rounded-3xl px-6 py-16 sm:py-24 relative overflow-hidden">
          
          {/* iOS Notifications - Bottom Right */}
          {/* <div className="absolute bottom-6 right-6 w-72 flex flex-col-reverse gap-2">
            {notifications.map((notification) => (
              visibleNotifications.includes(notification.id) && (
                <div 
                  key={`${notification.id}-${cycle}`} 
                  className="animate-slideUp"
                >
                  <div className="bg-white/10 backdrop-blur-2xl rounded-xl p-2.5 border border-white/20 shadow-2xl">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg p-1">
                        <img 
                          src="/shopify.png" 
                          alt="Shopify"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white">Order {notification.order}</span>
                          <span className="text-[9px] text-white/60">now</span>
                        </div>
                        <div className="text-[10px] text-white/70">{notification.price}, {notification.item}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div> */}
          
          {/* Main Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Save <span className="text-[#7cfc5c]">hours</span> by generating complete{" "}
              <span className="text-[#7cfc5c]">product listings in one click.</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-3xl mx-auto">
            Save 80%* of your product listing time — without expanding your team or increasing overhead.
            </p>
          </div>

          {/* Bullet Points */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="flex items-start gap-3 text-gray-300">
              <svg className="w-5 h-5 text-[#7cfc5c] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm sm:text-base">
                <span className="font-semibold text-white">Import products:</span> Import products from another Shopify store, Temu, or AliExpress with a single click.
              </p>
            </div>
            <div className="flex items-start gap-3 text-gray-300">
              <svg className="w-5 h-5 text-[#7cfc5c] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm sm:text-base">
                <span className="font-semibold text-white">AI translation and copywriting:</span> Generate compelling product descriptions in any language.
              </p>
            </div>
            <div className="flex items-start gap-3 text-gray-300">
              <svg className="w-5 h-5 text-[#7cfc5c] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm sm:text-base">
                <span className="font-semibold text-white">AI product picture generation and edit:</span> Create and enhance professional product images instantly.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-6 py-3 bg-[#7cfc5c] hover:bg-[#6ee84e] transition-all text-gray-900 font-semibold text-sm rounded-lg shadow-lg">
              Try for free - Start listing products in seconds
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-gray-600 hover:border-gray-500 transition-all text-white font-semibold text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Try It Now Section */}
      <div className="w-full py-16" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Try it now
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Paste any product URL from Shopify, Temu, or AliExpress to see the magic
            </p>
          </div>

          {/* Input Section */}
          <div className="relative flex items-center bg-white rounded-xl shadow-xl border border-gray-200">
            <Link className="absolute left-4 w-5 h-5 text-gray-900" />
            <input
              type="url"
              placeholder="https://www.aliexpress.com/item/..."
              className="w-full pl-12 pr-32 py-4 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 rounded-xl"
            />
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="absolute right-2 top-2 bottom-2 px-6 bg-[#7cfc5c] hover:bg-[#6ee84e] transition-all text-gray-900 font-semibold rounded-lg cursor-pointer"
            >
              Import
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your manual product listing method<br />is losing you time and money.
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-4xl mx-auto">
              Don't waste hours manually creating product descriptions, translating content, or editing images. Use our automated workflow to create complete, professional product listings in seconds and save 80%* of your listing time.
            </p>
          </div>

          {/* Three Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative flex">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-[#7cfc5c] rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-lg font-bold text-gray-900">1</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 pt-16 flex flex-col w-full">
                {/* Mock UI */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm h-44">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-xs text-gray-500">Paste product URL</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 mb-3">
                    <div className="text-[10px] text-gray-400 font-mono">aliexpress.com/product/...</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1 bg-gray-100 rounded-lg h-20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Paste product link</h3>
                <p className="text-gray-600 text-sm">
                  Simply paste any product URL from AliExpress, Temu, or another Shopify store and we'll instantly import all product details, images, and variants.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-[#7cfc5c] rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-lg font-bold text-gray-900">2</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 pt-16 flex flex-col w-full">
                {/* AI Processing UI */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm h-44 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900">AI Processing</span>
                    <span className="bg-[#7cfc5c] text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">Active</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs bg-purple-50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="font-medium text-gray-900">Copywriting</span>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium text-[10px]">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span className="font-medium text-gray-900">Translation</span>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium text-[10px]">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-pink-50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-900">Images</span>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium text-[10px]">✓</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Edit product with AI</h3>
                <p className="text-gray-600 text-sm">
                  Our AI automatically generates compelling, SEO-optimized product descriptions, translates them into any language, and creates professional product images.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-[#7cfc5c] rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-lg font-bold text-gray-900">3</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 pt-16 flex flex-col w-full">
                {/* Shopify Import UI */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm h-44">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1.5 border border-gray-200">
                        <img 
                          src="/shopify.png" 
                          alt="Shopify"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Shopify</div>
                        <div className="text-[10px] text-gray-500">Connected</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked readOnly />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7cfc5c]"></div>
                    </label>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                        <div className="space-y-1">
                          <div className="w-24 h-2 bg-gray-300 rounded"></div>
                          <div className="w-16 h-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-[#7cfc5c] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> 
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Let Voria import</h3>
                <p className="text-gray-600 text-sm">
                  Voria automatically imports your complete product listing to Shopify with all descriptions, translations, and images. Your product goes live in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Comparison Section */}
      <div className="w-full py-16 sm:py-24" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Features that <span className="text-gray-400">set us apart</span>
            </h2>
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden">
            <div className="bg-white rounded-t-2xl shadow-lg">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="text-left p-4 font-normal" style={{ width: '55%' }}></th>
                    <th className="p-4 bg-[#7cfc5c]/10 relative" style={{ width: '15%' }}>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#7cfc5c]"></div>
                      <div className="font-bold text-gray-900 text-sm">Voria</div>
                    </th>
                    <th className="p-4" style={{ width: '15%' }}>
                      <div className="font-semibold text-gray-900 text-sm">Competitor 1</div>
                    </th>
                    <th className="p-4" style={{ width: '15%' }}>
                      <div className="font-semibold text-gray-900 text-sm">Competitor 2</div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* Spacer Gap */}
            <div className="h-3" style={{ backgroundColor: '#F1F5F2' }}></div>
            <div className="bg-white rounded-b-2xl shadow-lg">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: '55%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <tbody>
                  {/* Instant Product Import */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">Instant Product Import</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                  </tr>

                  {/* Bulk Import Products and Collections */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">Bulk Import Products and Collections</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>

                  {/* Translate Products to Any Language */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">Translate Products to Any Language</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>

                  {/* Customization Options */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">Customization Options</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                  </tr>

                  {/* Easy to Use */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">Easy to Use</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>

                  {/* Pricing */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">Pricing</div>
                      <div className="text-xs text-gray-500 mt-0.5">Affordable plans for everyone</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>

                  {/* AI Product Image Generation */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">AI Product Image Generation</div>
                      <div className="text-xs text-gray-500 mt-0.5">Brand your store with AI fashion models.</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>

                  {/* AI Copywrite Generation */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">AI Copywrite Generation</div>
                      <div className="text-xs text-gray-500 mt-0.5">Replace your product lister with better quality AI listings.</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>

                  {/* AI Product Videos */}
                  <tr>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">AI Product Videos</span>
                        <span className="px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">BETA</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Advertise with AI fashion videos.</div>
                    </td>
                    <td className="p-4 bg-[#7cfc5c]/10 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-4 text-center">
                      <svg className="w-5 h-5 text-gray-300 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="w-full py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Lock in your seat for a <span className="text-gray-400">fair price</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-4xl mx-auto">
              Product research tools lose their edge when used by everybody. Therefore, we will only allow 500 dropshippers to work with us. Lock in your seat now with up to <span className="font-semibold text-gray-900">80% discount!</span>
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Starter plan</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$10</span>
                  <span className="text-gray-400 line-through">from $49,99</span>
                </div>
              </div>
              <button className="w-full py-3 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors mb-8">
                Get started
              </button>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">2000 credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Pre-set filters to find winners</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Magic search</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">WhatsApp customer service</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Access to 5M+ fashion dropshipping ads</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Access to 550K+ fashion dropshipping products</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Access to 115K+ fashion dropshipping stores</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Advanced filters on ads, products, and stores</span>
                </div>
              </div>
            </div>

            {/* Basic Plan - Most Popular */}
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-8 relative">
              <div className="absolute top-6 right-6 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Basic plan</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$30</span>
                  <span className="text-gray-400 line-through">from $74,99</span>
                </div>
              </div>
              <button className="w-full py-3 bg-[#7cfc5c] text-gray-900 font-semibold rounded-lg hover:bg-[#6ee84e] transition-colors mb-8">
                Get started
              </button>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Everything in the starter plan</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">10000 credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">One-click import competitors' product pages</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">12 hand-picked bestsellers</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Connect up to three stores</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 relative">
              <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                Beta
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Pro Plan</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$40</span>
                  <span className="text-gray-400 line-through">from $99,99</span>
                </div>
              </div>
              <button className="w-full py-3 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors mb-8">
                Send us a message
              </button>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Everything in the Basic plan</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Unlimited credits & stores connected</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">200 AI credits</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">AI-generated product pages (1 credit per product page)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">AI-generated branded product images (5 credit per image)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">AI-generated branded product videos (10 credits per video)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Auto-push products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full py-16 sm:py-24" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">How does Voria save me time and money?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Voria helps you identify winning products faster by showing you comprehensive competitor data and saturation levels, preventing you from wasting money on oversaturated products.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">How can I find the best products to sell?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Use our pre-set filters, magic search, and hand-picked bestsellers to discover products with high potential. Our platform analyzes millions of ads to find unsaturated winners.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">How can I estimate the saturation of a product?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Our product data shows all competitors actively advertising each product, breaking down saturation by country so you can find untapped markets.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Why does Voria focus on fashion only?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                By focusing exclusively on fashion, we can provide deeper insights, better data quality, and more accurate saturation metrics specific to the fashion dropshipping niche.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">What is unique about Voria?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                We take a product-focused approach, showing all competitors for each product, and we limit our user base to 500 dropshippers to protect against saturation.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Why won't we add Pinterest and TikTok?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                We focus exclusively on Facebook ads to maintain the highest quality data and most accurate insights. This specialization allows us to excel in one platform rather than spreading resources thin across multiple platforms.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="28" height="28" rx="8" fill="#4BF364"></rect>
                  <path d="M23.3902 11.3739C22.9829 7.21706 19.4282 4 15.0588 4C11.1708 4 7.91227 6.57364 6.96804 10.0727C6.81622 10.6402 6.23857 14.9308 5.73498 17.7141C5.17585 20.7974 4.60561 21.9794 4.50563 22.9373C4.4686 23.2987 4.61672 23.5879 4.87592 23.8048C5.13512 24.0217 5.5054 24.0578 5.87569 23.9132C7.27907 23.2301 8.70097 22.2469 9.71926 21.1444C9.89329 20.8986 10.1858 20.7359 10.5154 20.7359C10.8079 20.7359 11.0671 20.8625 11.2448 21.0613C11.3633 21.195 11.4559 21.4625 11.4818 21.6071C11.5485 22.0806 11.4226 22.5541 11.504 23.118C11.5781 23.5156 11.8373 23.8048 12.2076 23.9132C12.5038 24.0217 12.8741 23.9855 13.1703 23.8048C14.3738 23.1506 15.9067 21.0902 16.003 20.9926C16.1622 20.8335 16.3696 20.7359 16.6288 20.7359C16.8732 20.7359 17.1435 20.8299 17.3138 20.9781C17.3805 21.036 17.5212 21.2203 17.5841 21.3721C17.8396 21.8926 17.873 22.518 18.0581 23.1939C18.2062 23.7 18.6506 23.9892 19.1319 23.9892C19.4171 23.9892 19.6837 23.9024 19.8947 23.7108C21.9017 22.0408 24.0086 17.1574 23.3902 11.3739ZM14.096 15.3862C13.7628 15.6754 13.3925 15.82 13.0222 15.82C11.6151 15.82 10.9856 13.9765 11.0967 12.2053C11.1708 10.5787 11.8743 8.95211 13.0963 8.73523C13.1703 8.73523 13.2444 8.69908 13.3184 8.69908C14.4293 8.69908 15.5772 10.1088 15.5031 12.2053C15.4661 13.5066 14.9107 14.7356 14.096 15.3862ZM19.9466 15.3862C19.6133 15.6754 19.243 15.82 18.8727 15.82C17.4656 15.82 16.8362 13.9765 16.9472 12.2053C17.0213 10.5787 17.7248 8.95211 18.9468 8.73523C19.0209 8.73523 19.0949 8.69908 19.169 8.69908C20.2798 8.69908 21.4277 10.1088 21.3537 12.2053C21.3166 13.5066 20.7612 14.7356 19.9466 15.3862Z" fill="#10151E"></path>
                </svg>
                <span className="text-xl font-bold text-gray-900">Voria</span>
              </div>
              <p className="text-sm text-gray-600">
                "Within two weeks, our biggest beta client's winning rate increased by 31%"
              </p>
            </div>

            {/* Practical Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Practical Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/login" className="text-gray-600 hover:text-gray-900 text-sm">Login</a>
                </li>
                <li>
                  <a href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Try now</a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Contact Us</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Support page</a>
                </li>
                <li>
                  <a href="mailto:support@voria.com" className="text-gray-600 hover:text-gray-900 text-sm">support@voria.com</a>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Follow Us</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    Tiktok
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                      <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-600">
              © 2025 Voria, All rights reserved
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
