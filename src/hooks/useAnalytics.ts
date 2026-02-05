'use client'

/**
 * Hook for analytics tracking in React components
 * Provides convenient methods for tracking common actions
 */

import { useCallback, useRef } from 'react'
import {
  trackScanUpload,
  trackScanUploadStart,
  trackScanUploadComplete,
  trackScanUploadError,
  trackAnalysisStart,
  trackAnalysisComplete,
  trackAnalysisError,
  trackAffiliateLinkClick,
  trackScanLimitReached,
  trackFormulaViewed,
  trackTipsViewed,
  trackPurchaseInitiated,
  trackPurchaseComplete,
} from '@/lib/analytics'

interface UseAnalyticsReturn {
  // Scan tracking
  trackScanStart: (method: 'camera' | 'gallery' | 'drag_drop') => void
  trackScanSuccess: (
    method: 'camera' | 'gallery' | 'drag_drop',
    durationMs: number,
    fileSize?: number
  ) => void
  trackScanError: (
    method: 'camera' | 'gallery' | 'drag_drop',
    errorType: string,
    errorMessage?: string
  ) => void
  
  // Analysis tracking
  trackAnalysisBegin: (scanId?: string) => void
  trackAnalysisSuccess: (params: {
    scanId?: string
    confidenceScore?: number
    primaryPattern?: string
    hasFormula?: boolean
    hasAcupuncture?: boolean
    hasLifestyle?: boolean
    durationMs?: number
  }) => void
  trackAnalysisFailure: (errorType: string, errorMessage?: string, scanId?: string) => void
  
  // Affiliate tracking
  trackAffiliateClick: (params: {
    productId: string
    productName: string
    category: 'herbal_formula' | 'supplement' | 'book' | 'tool' | 'service'
    retailer: string
    value?: number
  }) => void
  
  // Premium tracking
  trackUpgradeStart: (tier: 'premium' | 'basic', value: number) => void
  trackUpgradeSuccess: (tier: 'premium' | 'basic', value: number, transactionId?: string) => void
  
  // Other tracking
  trackLimitReached: (currentPlan: 'free' | 'premium', limit: number) => void
  trackFormulaView: (name: string, chineseName?: string) => void
  trackTipsView: (category: string) => void
}

export function useAnalytics(): UseAnalyticsReturn {
  // Use refs to track timing
  const scanStartTime = useRef<number | null>(null)
  const analysisStartTime = useRef<number | null>(null)

  // Scan tracking
  const trackScanStart = useCallback((method: 'camera' | 'gallery' | 'drag_drop') => {
    scanStartTime.current = Date.now()
    trackScanUploadStart(method)
  }, [])

  const trackScanSuccess = useCallback((
    method: 'camera' | 'gallery' | 'drag_drop',
    durationMs?: number,
    fileSize?: number
  ) => {
    const processingTime = durationMs ?? (scanStartTime.current ? Date.now() - scanStartTime.current : 0)
    trackScanUploadComplete(method, processingTime, fileSize)
    scanStartTime.current = null
  }, [])

  const trackScanError = useCallback((
    method: 'camera' | 'gallery' | 'drag_drop',
    errorType: string,
    errorMessage?: string
  ) => {
    trackScanUploadError(method, errorType, errorMessage)
    scanStartTime.current = null
  }, [])

  // Analysis tracking
  const trackAnalysisBegin = useCallback((scanId?: string) => {
    analysisStartTime.current = Date.now()
    trackAnalysisStart(scanId)
  }, [])

  const trackAnalysisSuccess = useCallback(({
    scanId,
    confidenceScore,
    primaryPattern,
    hasFormula,
    hasAcupuncture,
    hasLifestyle,
    durationMs,
  }: {
    scanId?: string
    confidenceScore?: number
    primaryPattern?: string
    hasFormula?: boolean
    hasAcupuncture?: boolean
    hasLifestyle?: boolean
    durationMs?: number
  }) => {
    const processingTime = durationMs ?? (analysisStartTime.current ? Date.now() - analysisStartTime.current : 0)
    trackAnalysisComplete({
      scan_id: scanId,
      confidence_score: confidenceScore,
      primary_pattern: primaryPattern,
      has_herbal_formula: hasFormula,
      has_acupuncture: hasAcupuncture,
      has_lifestyle_recommendations: hasLifestyle,
      analysis_duration_ms: processingTime,
    })
    analysisStartTime.current = null
  }, [])

  const trackAnalysisFailure = useCallback((
    errorType: string,
    errorMessage?: string,
    scanId?: string
  ) => {
    trackAnalysisError(errorType, errorMessage, scanId)
    analysisStartTime.current = null
  }, [])

  // Affiliate tracking
  const trackAffiliateClick = useCallback(({
    productId,
    productName,
    category,
    retailer,
    value,
  }: {
    productId: string
    productName: string
    category: 'herbal_formula' | 'supplement' | 'book' | 'tool' | 'service'
    retailer: string
    value?: number
  }) => {
    trackAffiliateLinkClick({
      product_id: productId,
      product_name: productName,
      product_category: category,
      retailer,
      estimated_value: value,
    })
  }, [])

  // Premium tracking
  const trackUpgradeStart = useCallback((tier: 'premium' | 'basic', value: number) => {
    trackPurchaseInitiated({
      subscription_tier: tier,
      value,
      currency: 'USD',
    })
  }, [])

  const trackUpgradeSuccess = useCallback((tier: 'premium' | 'basic', value: number, transactionId?: string) => {
    trackPurchaseComplete({
      subscription_tier: tier,
      value,
      currency: 'USD',
      transaction_id: transactionId,
    })
  }, [])

  // Other tracking
  const trackLimitReached = useCallback((currentPlan: 'free' | 'premium', limit: number) => {
    trackScanLimitReached(currentPlan, limit)
  }, [])

  const trackFormulaView = useCallback((name: string, chineseName?: string) => {
    trackFormulaViewed(name, chineseName)
  }, [])

  const trackTipsView = useCallback((category: string) => {
    trackTipsViewed(category)
  }, [])

  return {
    trackScanStart,
    trackScanSuccess,
    trackScanError,
    trackAnalysisBegin,
    trackAnalysisSuccess,
    trackAnalysisFailure,
    trackAffiliateClick,
    trackUpgradeStart,
    trackUpgradeSuccess,
    trackLimitReached,
    trackFormulaView,
    trackTipsView,
  }
}