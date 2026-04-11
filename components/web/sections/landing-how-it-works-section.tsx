export function LandingHowItWorksSection() {
  return (
      <div id="how-it-works" className="scroll-mt-24 w-full py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your manual product listing method<br />is losing you time and money.
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-4xl mx-auto">
              Don&apos;t waste hours manually creating product descriptions, translating content, or editing images. Use our automated workflow to create complete, professional product listings in seconds and save 80%* of your listing time.
            </p>
          </div>

          {/* Three Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative flex">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-lg z-10">
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
                  Simply paste any product URL from AliExpress, Temu, or another Shopify store and we&apos;ll instantly import all product details, images, and variants.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-lg z-10">
                <span className="text-lg font-bold text-gray-900">2</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 pt-16 flex flex-col w-full">
                {/* AI Processing UI */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm h-44 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900">AI Processing</span>
                    <span className="bg-brand text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">Active</span>
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
              <div className="absolute -top-6 left-8 w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-lg z-10">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
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
                      <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> 
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Let Pullu handle imports</h3>
                <p className="text-gray-600 text-sm">
                  Pullu automatically imports your complete product listing to Shopify with all descriptions, translations, and images. Your product goes live in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
