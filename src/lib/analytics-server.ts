/**
 * Server-side Analytics Module
 * 
 * Provides analytics tracking for API routes using the Measurement Protocol
 * for server-to-server communication with GA4.
 */

interface ServerEventParams {
  [key: string]: string | number | boolean | undefined
}

interface ServerEvent {
  name: string
  params?: ServerEventParams
}

interface MeasurementProtocolPayload {
  client_id: string
  user_id?: string
  timestamp_micros?: string
  events: ServerEvent[]
  user_properties?: Record<string, { value: string | number }>
}

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
const GA4_API_SECRET = process.env.GA4_API_SECRET

/**
 * Generate a client ID for server-side tracking
 * In production, this should come from the client cookie
 */
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Send event to GA4 using Measurement Protocol
 */
export async function trackServerEvent(
  eventName: string,
  params?: ServerEventParams,
  options?: {
    clientId?: string
    userId?: string
    timestamp?: Date
  }
): Promise<void> {
  // Skip if not configured
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Server Debug]', eventName, params)
    }
    return
  }

  const clientId = options?.clientId || generateClientId()
  
  const payload: MeasurementProtocolPayload = {
    client_id: clientId,
    ...(options?.userId && { user_id: options.userId }),
    ...(options?.timestamp && { timestamp_micros: (options.timestamp.getTime() * 1000).toString() }),
    events: [{
      name: eventName,
      params: {
        ...params,
        engagement_time_msec: '1',
      },
    }],
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('GA4 server tracking failed:', await response.text())
    }
  } catch (error) {
    console.error('GA4 server tracking error:', error)
  }
}

/**
 * Track scan analysis completion from server
 */
export async function trackAnalysisCompleteServer(params: {
  userId?: string
  clientId?: string
  scanId?: string
  confidenceScore?: number
  primaryPattern?: string
  analysisDurationMs?: number
  hasError?: boolean
}): Promise<void> {
  await trackServerEvent('analysis_complete', {
    scan_id: params.scanId,
    confidence_score: params.confidenceScore,
    primary_pattern: params.primaryPattern,
    analysis_duration_ms: params.analysisDurationMs,
    has_error: params.hasError,
    event_category: 'analysis',
  }, {
    userId: params.userId,
    clientId: params.clientId,
  })
}

/**
 * Track subscription events from server (Stripe webhooks)
 */
export async function trackSubscriptionEvent(
  eventType: 'created' | 'updated' | 'cancelled' | 'payment_succeeded' | 'payment_failed',
  params: {
    userId?: string
    clientId?: string
    subscriptionId: string
    tier: string
    value?: number
    currency?: string
  }
): Promise<void> {
  const eventNames: Record<string, string> = {
    created: 'subscription_created',
    updated: 'subscription_updated',
    cancelled: 'subscription_cancelled',
    payment_succeeded: 'purchase',
    payment_failed: 'purchase_failed',
  }

  await trackServerEvent(eventNames[eventType], {
    subscription_id: params.subscriptionId,
    subscription_tier: params.tier,
    value: params.value,
    currency: params.currency || 'USD',
    event_category: 'subscription',
  }, {
    userId: params.userId,
    clientId: params.clientId,
  })
}

/**
 * Track affiliate link clicks from server
 */
export async function trackAffiliateClickServer(params: {
  userId?: string
  clientId?: string
  productId: string
  productName: string
  category: string
  retailer: string
  value?: number
}): Promise<void> {
  await trackServerEvent('affiliate_link_click', {
    product_id: params.productId,
    product_name: params.productName,
    product_category: params.category,
    retailer: params.retailer,
    estimated_value: params.value,
    event_category: 'affiliate',
  }, {
    userId: params.userId,
    clientId: params.clientId,
  })
}

/**
 * Track scan limit reached from server
 */
export async function trackScanLimitReachedServer(params: {
  userId?: string
  clientId?: string
  currentPlan: 'free' | 'premium'
  limit: number
}): Promise<void> {
  await trackServerEvent('scan_limit_reached', {
    current_plan: params.currentPlan,
    limit_reached: params.limit,
    event_category: 'limitations',
  }, {
    userId: params.userId,
    clientId: params.clientId,
  })
}

/**
 * Track user signup from server
 */
export async function trackSignupServer(params: {
  userId: string
  clientId?: string
  method?: 'email' | 'google' | 'apple'
}): Promise<void> {
  await trackServerEvent('sign_up', {
    method: params.method || 'email',
    event_category: 'user_lifecycle',
  }, {
    userId: params.userId,
    clientId: params.clientId,
  })
}

/**
 * Batch track multiple events
 */
export async function trackBatchEvents(
  events: Array<{ name: string; params?: ServerEventParams }>,
  options?: {
    clientId?: string
    userId?: string
  }
): Promise<void> {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Server Debug Batch]', events)
    }
    return
  }

  const clientId = options?.clientId || generateClientId()

  const payload: MeasurementProtocolPayload = {
    client_id: clientId,
    ...(options?.userId && { user_id: options.userId }),
    events: events.map(e => ({
      name: e.name,
      params: {
        ...e.params,
        engagement_time_msec: '1',
      },
    })),
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('GA4 batch tracking failed:', await response.text())
    }
  } catch (error) {
    console.error('GA4 batch tracking error:', error)
  }
}

export default {
  trackServerEvent,
  trackAnalysisCompleteServer,
  trackSubscriptionEvent,
  trackAffiliateClickServer,
  trackScanLimitReachedServer,
  trackSignupServer,
  trackBatchEvents,
}