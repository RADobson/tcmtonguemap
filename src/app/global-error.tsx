'use client'

import ErrorPage from '@/components/ui/ErrorPages'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorPage
          error={error}
          reset={reset}
          title="Critical Error"
          message="A critical error has occurred in the application. Please try reloading the page."
        />
      </body>
    </html>
  )
}
