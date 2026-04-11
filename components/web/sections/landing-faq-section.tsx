export function LandingFaqSection() {
  return (
      <div id="faq" className="scroll-mt-24 w-full py-16 sm:py-24 bg-surface">
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
                <span className="font-semibold text-gray-900">How does Pullu save me time?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Pullu automates the entire product listing creation process. What normally takes 20-45 minutes of manual work—copying descriptions, organizing variants, editing images, and translating content—now takes less than a minute. Simply paste a product URL and let Pullu handle the rest.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Which platforms does Pullu support?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Pullu works with AliExpress, Temu, and other Shopify stores. You can import products from any of these platforms directly to your Shopify store with a single click. All product data, including images, variants, and descriptions, are automatically collected and formatted.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">What AI features does Pullu offer?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Pullu includes AI-powered translation to any language, automatic copywriting for product descriptions and titles, and AI image generation and editing. You can enhance product images, remove backgrounds, and create professional visuals without any design skills.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Do I need technical knowledge to use Pullu?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                No technical knowledge is required. Pullu features an intuitive dashboard where you simply paste a product URL and click import. The platform handles all the technical details automatically, from data collection to Shopify integration.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">Can I edit products before importing to Shopify?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! Pullu allows you to review and edit all product information before importing. You can modify titles, descriptions, prices, variants, and images using our built-in AI tools. This ensures every listing matches your store&apos;s style and requirements.
              </div>
            </details>

            <details className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-gray-900">How does Pullu handle product variants?</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Pullu automatically organizes all product variants including sizes, colors, and styles. Variant images are correctly mapped and imported, ensuring each option displays the right image in your Shopify store. No manual organization needed.
              </div>
            </details>
          </div>
        </div>
      </div>
  )
}
