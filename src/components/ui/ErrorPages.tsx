'use client'

import { useEffect } from 'react'
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error?: Error & { digest?: string }
  reset?: () => void
  statusCode?: number
  title?: string
  message?: string
}

export default function ErrorPage({ 
  error, 
  reset,
  statusCode = 500,
  title = 'Something Went Wrong',
  message = 'We apologize for the inconvenience. An unexpected error has occurred.'
}: ErrorPageProps) {
  useEffect(() => {
    // Log error to analytics in production
    if (process.env.NODE_ENV === 'production' && error) {
      console.error('Error page rendered:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Error Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header with TCM styling */}
          <div className="relative bg-gradient-to-r from-tcm-green to-emerald-700 p-8 text-white text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-emerald-100 text-lg">
                {statusCode && <span className="font-mono opacity-80">Error {statusCode}</span>}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed mb-2">
                {message}
              </p>
              {error?.digest && (
                <p className="text-sm text-gray-400 font-mono">
                  Reference: {error.digest}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {reset && (
                <button
                  onClick={reset}
                  className="w-full py-4 px-6 bg-tcm-green text-white rounded-xl font-semibold text-lg 
                           hover:bg-emerald-800 active:scale-[0.98] transition-all duration-200
                           flex items-center justify-center gap-3 shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold 
                           hover:bg-gray-200 active:scale-[0.98] transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold 
                           hover:bg-gray-200 active:scale-[0.98] transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Go Back
                </button>
              </div>
            </div>

            {/* TCM Quote */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 italic font-serif">
                "The physician who knows how to harmonize the body knows the secret of health."
              </p>
              <p className="text-xs text-gray-400 mt-1">— Traditional Chinese Medicine wisdom</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 border-2 border-tcm-red/30 text-tcm-red px-4 py-2 rounded-lg">
            <span className="text-sm font-serif font-semibold">TCM Tongue Map</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            If this problem persists, please contact our support team
          </p>
        </div>
      </div>
    </div>
  )
}

// 404 Not Found Page
export function NotFoundPage() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
    />
  )
}

// 403 Forbidden Page
export function ForbiddenPage() {
  return (
    <ErrorPage
      statusCode={403}
      title="Access Denied"
      message="You don't have permission to access this page. Please sign in to continue."
    />
  )
}

// Network Error Page
export function NetworkErrorPage({ reset }: { reset?: () => void }) {
  return (
    <ErrorPage
      statusCode={503}
      title="Connection Error"
      message="We're having trouble connecting to our servers. Please check your internet connection and try again."
      reset={reset}
    />
  )
}

// Analysis Error Page
export function AnalysisErrorPage({ reset }: { reset?: () => void }) {
  return (
    <ErrorPage
      title="Analysis Failed"
      message="We couldn't complete your tongue analysis. This might be due to image quality or a temporary service issue."
      reset={reset}
    />
  )
}
