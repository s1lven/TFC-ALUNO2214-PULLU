'use client'

import Header from "@/components/header";

export default function BlogPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F1F5F2' }}>
      <Header />
      
      {/* Blog Content */}
      <div className="flex-1 w-full py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Blog
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Stay updated with the latest tips, guides, and news about product listing automation.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Empty state for now */}
            <div className="col-span-full text-center py-16">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No blog posts yet</h2>
              <p className="text-gray-600">Check back soon for new content!</p>
            </div>
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
                <span className="text-xl font-bold text-gray-900">Pullu</span>
              </div>
              <p className="text-sm text-gray-600">
                Automate your product listings and save hours every day. Built for modern e-commerce.
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
                  <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">Support page</a>
                </li>
                <li>
                  <a href="mailto:support@pullu.app" className="text-gray-600 hover:text-gray-900 text-sm">support@pullu.app</a>
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
              © 2025 Pullu, All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
