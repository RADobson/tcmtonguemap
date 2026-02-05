'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
    
    // Log to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <DefaultErrorFallback 
        error={this.state.error} 
        onReset={this.handleReset}
        onReload={this.handleReload}
      />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ 
  error, 
  onReset,
  onReload 
}: { 
  error: Error | null
  onReset: () => void
  onReload: () => void
}) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Error Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-tcm-green to-emerald-700 p-6 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold">Something Went Wrong</h1>
            <p className="text-emerald-100 mt-1">We apologize for the inconvenience</p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                An unexpected error has occurred. Our team has been notified and we're working to fix it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onReload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tcm-green text-white rounded-xl font-semibold hover:bg-emerald-800 active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </div>
            </div>

            {/* Error Details (Collapsible) */}
            <div className="border-t border-gray-100 pt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                {showDetails ? 'Hide' : 'Show'} technical details
              </button>
              
              {showDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl overflow-hidden">
                  <p className="text-sm font-mono text-red-600 break-all">
                    {error?.toString()}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                      {error?.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Support */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">Need help?</p>
              <a
                href="mailto:support@tcmtonguemap.com"
                className="inline-flex items-center gap-2 text-tcm-green hover:text-emerald-800 font-medium"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* TCM Seal */}
        <div className="mt-6 text-center">
          <div className="inline-block border-2 border-tcm-red/30 text-tcm-red px-4 py-2 rounded-lg">
            <span className="text-sm font-serif">TCM Tongue Map</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for use in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error)
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const ErrorFallback = error ? (
    <DefaultErrorFallback 
      error={error} 
      onReset={clearError}
      onReload={() => window.location.reload()}
    />
  ) : null

  return { error, handleError, clearError, ErrorFallback }
}
