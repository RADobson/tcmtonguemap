'use client'

/**
 * Google Analytics 4 Provider Component
 * Handles GA4 initialization and route change tracking
 */

import { useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { trackPageView, isGA4Initialized, setUserProperties } from '@/lib/analytics'

interface GA4ProviderProps {
  children: React.ReactNode
  measurementId: string
  userId?: string
  userProperties?: {
    subscription_tier?: string
    scans_completed?: number
    signup_date?: string
  }
}

export default function GA4Provider({
  children,
  measurementId,
  userId,
  userProperties,
}: GA4ProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views on route changes
  const handleRouteChange = useCallback(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(document.title, window.location.href)
  }, [pathname, searchParams])

  useEffect(() => {
    handleRouteChange()
  }, [handleRouteChange])

  // Set user properties when they change
  useEffect(() => {
    if (userId && isGA4Initialized()) {
      setUserProperties({
        user_id: userId,
        ...userProperties,
      })
    }
  }, [userId, userProperties])

  return (
    <>
      {/* GA4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              send_page_view: false,
              ${userId ? `user_id: '${userId}',` : ''}
              cookie_flags: 'SameSite=None;Secure',
              allow_google_signals: true,
              allow_ad_personalization_signals: true,
              custom_map: {
                'dimension1': 'subscription_tier',
                'dimension2': 'scans_completed',
                'dimension3': 'user_type'
              }
            });
          `,
        }}
      />
      {children}
    </>
  )
}