import {
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
  isGA4Initialized,
  GA4_EVENTS,
} from '@/lib/analytics'

describe('analytics', () => {
  const mockGtag = jest.fn()

  beforeEach(() => {
    // Reset window.gtag before each test
    ;(window as any).gtag = mockGtag
    jest.clearAllMocks()
  })

  afterEach(() => {
    delete (window as any).gtag
  })

  describe('isGA4Initialized', () => {
    it('returns true when gtag is defined', () => {
      expect(isGA4Initialized()).toBe(true)
    })

    it('returns false when gtag is undefined', () => {
      delete (window as any).gtag
      expect(isGA4Initialized()).toBe(false)
    })

    it('returns false when window is undefined (SSR)', () => {
      const originalWindow = global.window
      delete (global as any).window
      expect(isGA4Initialized()).toBe(false)
      global.window = originalWindow
    })
  })

  describe('trackEvent', () => {
    it('calls gtag with event name and params', () => {
      trackEvent(GA4_EVENTS.SCAN_UPLOAD, { method: 'camera' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'scan_upload', {
        method: 'camera',
        event_timestamp: expect.any(String),
      })
    })

    it('logs to console in development when gtag is not available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      delete (window as any).gtag

      trackEvent(GA4_EVENTS.SCAN_UPLOAD, { method: 'camera' })

      expect(consoleSpy).toHaveBeenCalledWith('[GA4 Debug]', 'scan_upload', { method: 'camera' })

      consoleSpy.mockRestore()
    })

    it('handles errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('GA4 error')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      trackEvent(GA4_EVENTS.SCAN_UPLOAD)

      expect(consoleSpy).toHaveBeenCalledWith('GA4 tracking error:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    it('calls gtag with page view event', () => {
      trackPageView('Test Page', 'https://example.com')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Test Page',
        page_location: 'https://example.com',
        page_path: '/',
        event_timestamp: expect.any(String),
      })
    })

    it('uses current window location when not provided', () => {
      trackPageView('Test Page')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'page_view',
        expect.objectContaining({
          page_title: 'Test Page',
          page_location: expect.any(String),
          page_path: expect.any(String),
        })
      )
    })

    it('includes additional params when provided', () => {
      trackPageView('Test Page', 'https://example.com', { custom_param: 'value' })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'page_view',
        expect.objectContaining({
          custom_param: 'value',
        })
      )
    })
  })

  describe('trackScanUpload', () => {
    it('tracks scan upload with method', () => {
      trackScanUpload({ method: 'camera' })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_upload',
        expect.objectContaining({
          method: 'camera',
          event_category: 'scan',
          event_label: 'camera',
        })
      )
    })

    it('tracks scan upload with all params', () => {
      trackScanUpload({
        method: 'gallery',
        file_size: 1024,
        image_format: 'jpeg',
        compression_ratio: 0.8,
        processing_time_ms: 500,
      })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_upload',
        expect.objectContaining({
          method: 'gallery',
          file_size: 1024,
          image_format: 'jpeg',
          compression_ratio: 0.8,
          processing_time_ms: 500,
        })
      )
    })
  })

  describe('trackScanUploadStart', () => {
    it('tracks upload start event', () => {
      trackScanUploadStart('drag_drop')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_upload_start',
        expect.objectContaining({
          method: 'drag_drop',
          event_category: 'scan',
        })
      )
    })
  })

  describe('trackScanUploadComplete', () => {
    it('tracks upload complete with duration', () => {
      trackScanUploadComplete('paste', 1200, 2048)

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_upload_complete',
        expect.objectContaining({
          method: 'paste',
          processing_time_ms: 1200,
          file_size: 2048,
          event_category: 'scan',
        })
      )
    })
  })

  describe('trackScanUploadError', () => {
    it('tracks upload error with details', () => {
      trackScanUploadError('camera', 'permission_denied', 'User denied camera access')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_upload_error',
        expect.objectContaining({
          method: 'camera',
          error_type: 'permission_denied',
          error_message: 'User denied camera access',
          event_category: 'scan',
        })
      )
    })
  })

  describe('trackAnalysisStart', () => {
    it('tracks analysis start', () => {
      trackAnalysisStart('scan-123')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'analysis_start',
        expect.objectContaining({
          scan_id: 'scan-123',
          event_category: 'analysis',
        })
      )
    })

    it('tracks analysis start without scan id', () => {
      trackAnalysisStart()

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'analysis_start',
        expect.objectContaining({
          event_category: 'analysis',
        })
      )
    })
  })

  describe('trackAnalysisComplete', () => {
    it('tracks analysis complete with all params', () => {
      trackAnalysisComplete({
        scan_id: 'scan-123',
        confidence_score: 0.85,
        primary_pattern: 'Spleen Qi Deficiency',
        secondary_patterns: 'Dampness',
        analysis_duration_ms: 3000,
        has_herbal_formula: true,
        has_acupuncture: true,
        has_lifestyle_recommendations: true,
      })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'analysis_complete',
        expect.objectContaining({
          scan_id: 'scan-123',
          confidence_score: 0.85,
          primary_pattern: 'Spleen Qi Deficiency',
          secondary_patterns: 'Dampness',
          analysis_duration_ms: 3000,
          has_herbal_formula: true,
          has_acupuncture: true,
          has_lifestyle_recommendations: true,
          event_category: 'analysis',
          event_label: 'Spleen Qi Deficiency',
        })
      )
    })
  })

  describe('trackAnalysisError', () => {
    it('tracks analysis error', () => {
      trackAnalysisError('timeout', 'Request timed out', 'scan-123')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'analysis_error',
        expect.objectContaining({
          scan_id: 'scan-123',
          error_type: 'timeout',
          error_message: 'Request timed out',
          event_category: 'analysis',
        })
      )
    })
  })

  describe('trackAnalysisView', () => {
    it('tracks analysis view', () => {
      trackAnalysisView('scan-123', 'Spleen Qi Deficiency')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'analysis_view',
        expect.objectContaining({
          scan_id: 'scan-123',
          primary_pattern: 'Spleen Qi Deficiency',
          event_category: 'analysis',
        })
      )
    })
  })

  describe('trackSignUp', () => {
    it('tracks email sign up', () => {
      trackSignUp('email')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'sign_up',
        expect.objectContaining({
          method: 'email',
          event_category: 'user_lifecycle',
        })
      )
    })

    it('defaults to email method', () => {
      trackSignUp()

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'sign_up',
        expect.objectContaining({
          method: 'email',
        })
      )
    })

    it('tracks google sign up', () => {
      trackSignUp('google')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'sign_up',
        expect.objectContaining({
          method: 'google',
        })
      )
    })
  })

  describe('trackLogin', () => {
    it('tracks login with method', () => {
      trackLogin('google')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'login',
        expect.objectContaining({
          method: 'google',
          event_category: 'user_lifecycle',
        })
      )
    })
  })

  describe('trackPurchaseInitiated', () => {
    it('tracks purchase initiated', () => {
      trackPurchaseInitiated({
        currency: 'USD',
        value: 9.99,
        subscription_tier: 'premium',
      })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'begin_checkout',
        expect.objectContaining({
          currency: 'USD',
          value: 9.99,
          subscription_tier: 'premium',
          event_category: 'ecommerce',
        })
      )
    })
  })

  describe('trackPurchaseComplete', () => {
    it('tracks purchase complete', () => {
      trackPurchaseComplete({
        transaction_id: 'txn_123',
        value: 99.99,
        currency: 'USD',
        subscription_tier: 'premium',
        coupon: 'SAVE10',
      })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'purchase',
        expect.objectContaining({
          transaction_id: 'txn_123',
          value: 99.99,
          currency: 'USD',
          subscription_tier: 'premium',
          coupon: 'SAVE10',
          event_category: 'ecommerce',
        })
      )
    })
  })

  describe('trackPurchaseCancelled', () => {
    it('tracks purchase cancelled', () => {
      trackPurchaseCancelled('premium', 'Too expensive')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'purchase_cancelled',
        expect.objectContaining({
          subscription_tier: 'premium',
          cancellation_reason: 'Too expensive',
          event_category: 'ecommerce',
        })
      )
    })
  })

  describe('trackSubscriptionUpgrade', () => {
    it('tracks subscription upgrade', () => {
      trackSubscriptionUpgrade('basic', 'premium', 99.99)

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'subscription_upgrade',
        expect.objectContaining({
          from_tier: 'basic',
          to_tier: 'premium',
          value: 99.99,
          event_category: 'subscription',
        })
      )
    })
  })

  describe('trackAffiliateLinkClick', () => {
    it('tracks affiliate link click', () => {
      trackAffiliateLinkClick({
        product_id: 'prod_123',
        product_name: 'Herbal Formula',
        product_category: 'herbal_formula',
        retailer: 'Amazon',
        affiliate_id: 'aff_456',
      })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'affiliate_link_click',
        expect.objectContaining({
          product_id: 'prod_123',
          product_name: 'Herbal Formula',
          product_category: 'herbal_formula',
          retailer: 'Amazon',
          affiliate_id: 'aff_456',
          event_category: 'affiliate',
          event_label: 'Herbal Formula',
        })
      )
    })
  })

  describe('trackAffiliateProductView', () => {
    it('tracks affiliate product view', () => {
      trackAffiliateProductView({
        product_id: 'prod_123',
        product_name: 'TCM Book',
        product_category: 'book',
      })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'affiliate_product_view',
        expect.objectContaining({
          product_id: 'prod_123',
          product_name: 'TCM Book',
          product_category: 'book',
          event_category: 'affiliate',
        })
      )
    })
  })

  describe('trackScanLimitReached', () => {
    it('tracks free plan limit reached', () => {
      trackScanLimitReached('free', 3)

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_limit_reached',
        expect.objectContaining({
          current_plan: 'free',
          limit_reached: 3,
          event_category: 'limitations',
        })
      )
    })

    it('tracks premium plan limit reached', () => {
      trackScanLimitReached('premium', 100)

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'scan_limit_reached',
        expect.objectContaining({
          current_plan: 'premium',
          limit_reached: 100,
        })
      )
    })
  })

  describe('trackFormulaViewed', () => {
    it('tracks formula viewed', () => {
      trackFormulaViewed('Si Jun Zi Tang', '四君子汤')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'formula_viewed',
        expect.objectContaining({
          formula_name: 'Si Jun Zi Tang',
          formula_chinese_name: '四君子汤',
          event_category: 'content',
        })
      )
    })
  })

  describe('trackTipsViewed', () => {
    it('tracks tips viewed', () => {
      trackTipsViewed('tongue_photo')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'tips_viewed',
        expect.objectContaining({
          tip_category: 'tongue_photo',
          event_category: 'engagement',
        })
      )
    })
  })
})
