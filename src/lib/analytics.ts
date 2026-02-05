'use client'

/**
 * TCM Tongue Map - Google Analytics 4 Event Tracking
 * 
 * This module provides type-safe event tracking for GA4.
 * All events follow Google's recommended event structure.
 */

// GA4 Event Names - using Google's standard events where applicable
export const GA4_EVENTS = {
  // User Lifecycle
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Scan Events
  SCAN_UPLOAD: 'scan_upload',
  SCAN_UPLOAD_START: 'scan_upload_start',
  SCAN_UPLOAD_COMPLETE: 'scan_upload_complete',
  SCAN_UPLOAD_ERROR: 'scan_upload_error',
  
  // Analysis Events
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_COMPLETE: 'analysis_complete',
  ANALYSIS_ERROR: 'analysis_error',
  ANALYSIS_VIEW: 'analysis_view',
  ANALYSIS_SHARE: 'share',
  
  // Premium/Subscription Events
  PURCHASE_INITIATED: 'begin_checkout',
  PURCHASE_COMPLETE: 'purchase',
  PURCHASE_CANCELLED: 'purchase_cancelled',
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade',
  SUBSCRIPTION_DOWNGRADE: 'subscription_downgrade',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Affiliate Events
  AFFILIATE_LINK_CLICK: 'affiliate_link_click',
  AFFILIATE_PRODUCT_VIEW: 'affiliate_product_view',
  
  // E-commerce Events
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  
  // Engagement Events
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',
  SCROLL: 'scroll',
  CLICK: 'click',
  FILE_DOWNLOAD: 'file_download',
  VIDEO_START: 'video_start',
  VIDEO_COMPLETE: 'video_complete',
  
  // Custom Events
  SCAN_LIMIT_REACHED: 'scan_limit_reached',
  CAMERA_USED: 'camera_used',
  GALLERY_USED: 'gallery_used',
  TIPS_VIEWED: 'tips_viewed',
  FORMULA_VIEWED: 'formula_viewed',
} as const

// Type for event names
type GA4EventName = typeof GA4_EVENTS[keyof typeof GA4_EVENTS]

// Event Parameters Interfaces
interface BaseParams {
  [key: string]: string | number | boolean | undefined
}

interface ScanUploadParams extends BaseParams {
  method: 'camera' | 'gallery' | 'drag_drop' | 'paste'
  file_size?: number
  image_format?: string
  compression_ratio?: number
  processing_time_ms?: number
}

interface AnalysisParams extends BaseParams {
  scan_id?: string
  confidence_score?: number
  primary_pattern?: string
  secondary_patterns?: string
  analysis_duration_ms?: number
  has_herbal_formula?: boolean
  has_acupuncture?: boolean
  has_lifestyle_recommendations?: boolean
}

interface PurchaseParams extends BaseParams {
  currency?: string
  value?: number
  transaction_id?: string
  subscription_tier?: 'premium' | 'basic' | 'enterprise'
  coupon?: string
}

interface AffiliateParams extends BaseParams {
  product_id?: string
  product_name?: string
  product_category?: 'herbal_formula' | 'supplement' | 'book' | 'tool' | 'service'
  retailer?: string
  affiliate_id?: string
  estimated_value?: number
}

// Global window interface augmentation
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>
    ) => void
    dataLayer?: Array<Record<string, unknown>>
  }
}

/**
 * Check if GA4 is properly initialized
 */
export function isGA4Initialized(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Generic event tracking function
 */
export function trackEvent(
  eventName: GA4EventName,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (!isGA4Initialized()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Debug]', eventName, params)
    }
    return
  }

  try {
    window.gtag!('event', eventName, {
      ...params,
      event_timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('GA4 tracking error:', error)
  }
}

/**
 * Page view tracking
 */
export function trackPageView(
  pageTitle: string,
  pageLocation?: string,
  additionalParams?: BaseParams
): void {
  if (!isGA4Initialized()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Debug] Page View:', pageTitle, pageLocation)
    }
    return
  }

  try {
    window.gtag!('event', 'page_view', {
      page_title: pageTitle,
      page_location: pageLocation || (typeof window !== 'undefined' ? window.location.href : undefined),
      page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ...additionalParams,
    })
  } catch (error) {
    console.error('GA4 page view error:', error)
  }
}

/**
 * Scan upload tracking
 */
export function trackScanUpload(params: ScanUploadParams): void {
  trackEvent(GA4_EVENTS.SCAN_UPLOAD, {
    ...params,
    event_category: 'scan',
    event_label: params.method,
  })
}

export function trackScanUploadStart(method: ScanUploadParams['method']): void {
  trackEvent(GA4_EVENTS.SCAN_UPLOAD_START, {
    method,
    event_category: 'scan',
  })
}

export function trackScanUploadComplete(
  method: ScanUploadParams['method'],
  durationMs: number,
  fileSize?: number
): void {
  trackEvent(GA4_EVENTS.SCAN_UPLOAD_COMPLETE, {
    method,
    processing_time_ms: durationMs,
    file_size: fileSize,
    event_category: 'scan',
  })
}

export function trackScanUploadError(
  method: ScanUploadParams['method'],
  errorType: string,
  errorMessage?: string
): void {
  trackEvent(GA4_EVENTS.SCAN_UPLOAD_ERROR, {
    method,
    error_type: errorType,
    error_message: errorMessage,
    event_category: 'scan',
  })
}

/**
 * Analysis tracking
 */
export function trackAnalysisStart(scanId?: string): void {
  trackEvent(GA4_EVENTS.ANALYSIS_START, {
    scan_id: scanId,
    event_category: 'analysis',
  })
}

export function trackAnalysisComplete(params: AnalysisParams): void {
  trackEvent(GA4_EVENTS.ANALYSIS_COMPLETE, {
    ...params,
    event_category: 'analysis',
    event_label: params.primary_pattern,
  })
}

export function trackAnalysisError(
  errorType: string,
  errorMessage?: string,
  scanId?: string
): void {
  trackEvent(GA4_EVENTS.ANALYSIS_ERROR, {
    scan_id: scanId,
    error_type: errorType,
    error_message: errorMessage,
    event_category: 'analysis',
  })
}

export function trackAnalysisView(scanId: string, primaryPattern: string): void {
  trackEvent(GA4_EVENTS.ANALYSIS_VIEW, {
    scan_id: scanId,
    primary_pattern: primaryPattern,
    event_category: 'analysis',
  })
}

/**
 * Sign up tracking
 */
export function trackSignUp(method: 'email' | 'google' | 'apple' = 'email'): void {
  trackEvent(GA4_EVENTS.SIGN_UP, {
    method,
    event_category: 'user_lifecycle',
  })
}

export function trackLogin(method: 'email' | 'google' | 'apple' = 'email'): void {
  trackEvent(GA4_EVENTS.LOGIN, {
    method,
    event_category: 'user_lifecycle',
  })
}

/**
 * Premium/Subscription tracking
 */
export function trackPurchaseInitiated(params: PurchaseParams): void {
  trackEvent(GA4_EVENTS.PURCHASE_INITIATED, {
    ...params,
    event_category: 'ecommerce',
  })
}

export function trackPurchaseComplete(params: PurchaseParams): void {
  trackEvent(GA4_EVENTS.PURCHASE_COMPLETE, {
    ...params,
    event_category: 'ecommerce',
  })
}

export function trackPurchaseCancelled(
  subscriptionTier: PurchaseParams['subscription_tier'],
  reason?: string
): void {
  trackEvent(GA4_EVENTS.PURCHASE_CANCELLED, {
    subscription_tier: subscriptionTier,
    cancellation_reason: reason,
    event_category: 'ecommerce',
  })
}

export function trackSubscriptionUpgrade(
  fromTier: string,
  toTier: string,
  value: number
): void {
  trackEvent(GA4_EVENTS.SUBSCRIPTION_UPGRADE, {
    from_tier: fromTier,
    to_tier: toTier,
    value,
    event_category: 'subscription',
  })
}

/**
 * Affiliate link tracking
 */
export function trackAffiliateLinkClick(params: AffiliateParams): void {
  trackEvent(GA4_EVENTS.AFFILIATE_LINK_CLICK, {
    ...params,
    event_category: 'affiliate',
    event_label: params.product_name,
  })
}

export function trackAffiliateProductView(params: AffiliateParams): void {
  trackEvent(GA4_EVENTS.AFFILIATE_PRODUCT_VIEW, {
    ...params,
    event_category: 'affiliate',
  })
}

/**
 * Scan limit tracking
 */
export function trackScanLimitReached(
  currentPlan: 'free' | 'premium',
  limit: number
): void {
  trackEvent(GA4_EVENTS.SCAN_LIMIT_REACHED, {
    current_plan: currentPlan,
    limit_reached: limit,
    event_category: 'limitations',
  })
}

/**
 * Herbal formula tracking
 */
export function trackFormulaViewed(
  formulaName: string,
  formulaChineseName?: string
): void {
  trackEvent(GA4_EVENTS.FORMULA_VIEWED, {
    formula_name: formulaName,
    formula_chinese_name: formulaChineseName,
    event_category: 'content',
  })
}

/**
 * Tips tracking
 */
export function trackTipsViewed(tipCategory: string): void {
  trackEvent(GA4_EVENTS.TIPS_VIEWED, {
    tip_category: tipCategory,
    event_category: 'engagement',
  })
}

/**
 * Hook for tracking page views in Next.js
 */
export function usePageTracking(pageTitle: string): void {
  if (typeof window !== 'undefined') {
    trackPageView(pageTitle)
  }
}

/**
 * Initialize user properties for better segmentation
 */
export function setUserProperties(properties: {
  user_id?: string
  subscription_tier?: string
  scans_completed?: number
  signup_date?: string
  last_scan_date?: string
}): void {
  if (!isGA4Initialized()) return

  try {
    window.gtag!('event', 'set_user_properties', properties)
  } catch (error) {
    console.error('GA4 user properties error:', error)
  }
}

export default {
  trackEvent,
  trackPageView,
  trackScanUpload,
  trackScanUploadStart,
  trackScanUploadComplete,
  trackScanUploadError,
  trackAnalysisStart,
  trackAnalysisComplete,
  trackAnalysisError,
  trackAnalysisView,
  trackSignUp,
  trackLogin,
  trackPurchaseInitiated,
  trackPurchaseComplete,
  trackPurchaseCancelled,
  trackSubscriptionUpgrade,
  trackAffiliateLinkClick,
  trackAffiliateProductView,
  trackScanLimitReached,
  trackFormulaViewed,
  trackTipsViewed,
  setUserProperties,
  isGA4Initialized,
  GA4_EVENTS,
}