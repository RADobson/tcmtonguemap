'use client'

import ErrorPage from '@/components/ui/ErrorPages'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Signup page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcm-green to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ErrorPage
          error={error}
          reset={reset}
          title="Sign Up Error"
          message="We couldn't complete the registration process. Please try again."
        />
      </div>
    </div>
  )
}
