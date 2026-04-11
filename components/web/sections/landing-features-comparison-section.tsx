export function LandingFeaturesComparisonSection() {
  return (
      <div id="features" className="scroll-mt-24 w-full py-16 sm:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Features that set us apart
            </h2>
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden">
            <div className="bg-white rounded-t-2xl shadow-lg">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="text-left p-4 font-normal" style={{ width: '55%' }}></th>
                    <th className="p-4 bg-brand/10 relative" style={{ width: '15%' }}>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-brand"></div>
                      <div className="font-bold text-gray-900 text-sm">Pullu</div>
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
            <div className="h-3 bg-surface"></div>
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
                    <td className="p-4 bg-brand/10 text-center">
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
                    <td className="p-4 bg-brand/10 text-center">
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
                    <td className="p-4 bg-brand/10 text-center">
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
                    <td className="p-4 bg-brand/10 text-center">
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
                    <td className="p-4 bg-brand/10 text-center">
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

                  {/* AI Product Image Generation */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">AI Product Image Generation</span>
                        <span className="px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">BETA</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Brand your store with AI-generated product images.</div>
                    </td>
                    <td className="p-4 bg-brand/10 text-center">
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
                    <td className="p-4 bg-brand/10 text-center">
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
                      <div className="text-xs text-gray-500 mt-0.5">Advertise with AI-generated product videos.</div>
                    </td>
                    <td className="p-4 bg-brand/10 text-center">
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
  )
}
