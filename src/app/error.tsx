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
    console.error('Root error boundary caught:', error)
  }, [error])

  return (
    <ErrorPage
      error={error}
      reset={reset}
    />
  )
}
