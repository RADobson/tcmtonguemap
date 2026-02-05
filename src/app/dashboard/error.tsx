'use client'

import ErrorPage, { AnalysisErrorPage } from '@/components/ui/ErrorPages'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ErrorPage
          error={error}
          reset={reset}
          title="Dashboard Error"
          message="We couldn't load your dashboard. This might be a temporary issue."
        />
      </div>
    </div>
  )
}
