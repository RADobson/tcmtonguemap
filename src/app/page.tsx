'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  Upload, 
  Camera, 
  Loader2, 
  Sparkles, 
  Shield, 
  Leaf, 
  Crown,
  Zap,
  AlertCircle,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import ImageUploader from '@/components/ImageUploader'
import AnalysisResults from '@/components/AnalysisResults'
import { useToast } from '@/components/ui/ToastProvider'
import { AnalysisLoadingSkeleton } from '@/components/ui/LoadingSkeletons'
import { useAnalytics } from '@/hooks/useAnalytics'

interface AnalysisResult {
  primaryPattern: string
  secondaryPatterns?: string[]
  coat: string
  color: string
  shape: string
  moisture: string
  recommendations?: string
  recommendedFormula: string
  severity?: 'mild' | 'moderate' | 'significant'
  tongueZones?: {
    tip: string
    center: string
    root: string
    sides: string
  }
  saved?: boolean
}

interface ScanStatus {
  canScan: boolean
  tier: string
  scansToday: number
  scansRemaining: number
  message: string
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const { showToast } = useToast()
  const analytics = useAnalytics()

  // Check scan status on load
  useEffect(() => {
    checkScanStatus()
    fetchSubscriptionStatus()
  }, [])

  const checkScanStatus = async () => {
    try {
      const response = await fetch('/api/scan-limit')
      if (response.ok) {
        const data = await response.json()
        setScanStatus(data)
      }
    } catch (err) {
      console.error('Error checking scan status:', err)
      showToast('Failed to check scan status', 'error')
    } finally {
      setLoadingStatus(false)
    }
  }

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (err) {
      console.error('Error fetching subscription:', err)
    }
  }

  const handleImageSelect = useCallback(async (imageData: string) => {
    setSelectedImage(imageData)
    setResult(null)
    showToast('Image uploaded successfully', 'success', { duration: 2000 })
  }, [showToast])

  const handleClear = useCallback(() => {
    setSelectedImage(null)
    setResult(null)
    showToast('Image cleared', 'info', { duration: 2000 })
  }, [showToast])

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return
    
    // Check scan limit before analyzing
    try {
      const scanCheckResponse = await fetch('/api/scan-limit')
      if (scanCheckResponse.ok) {
        const scanData = await scanCheckResponse.json()
        if (!scanData.canScan) {
          // Track scan limit reached event
          analytics.trackLimitReached(scanData.tier as 'free' | 'premium', scanData.scansToday)
          
          showToast(
            'Daily scan limit reached. Upgrade for unlimited scans!',
            'warning',
            {
              duration: 6000,
              action: {
                label: 'Upgrade',
                onClick: () => window.location.href = '/pricing'
              }
            }
          )
          return
        }
      }
    } catch (err) {
      console.error('Error checking scan limit:', err)
    }
    
    setIsAnalyzing(true)
    const analysisStartTime = Date.now()
    
    // Track analysis start
    analytics.trackAnalysisBegin()
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const data = await response.json()
      const analysisDuration = Date.now() - analysisStartTime
      
      // Record the scan after successful analysis
      await fetch('/api/scan-limit', { method: 'POST' })
      
      // Refresh scan status
      await checkScanStatus()
      
      // Track analysis completion with details
      analytics.trackAnalysisSuccess({
        primaryPattern: data.patternDifferentiation?.primaryPattern?.name || data.primaryPattern,
        confidenceScore: data.patternDifferentiation?.primaryPattern?.confidence,
        hasFormula: !!data.herbalFormula?.recommended,
        hasAcupuncture: !!data.acupuncture?.primaryPoints?.length,
        hasLifestyle: !!data.lifestyleRecommendations,
        durationMs: analysisDuration,
      })
      
      setResult(data)
      showToast('Analysis completed successfully!', 'success')
      
      // Scroll to results on mobile
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Analysis failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please try again.'
      
      // Track analysis error
      analytics.trackAnalysisFailure(
        error instanceof Error ? error.name : 'UnknownError',
        errorMessage
      )
      
      showToast(errorMessage, 'error', {
        duration: 6000,
        action: {
          label: 'Try Again',
          onClick: () => handleAnalyze()
        }
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedImage, showToast])

  const handleReset = useCallback(() => {
    setSelectedImage(null)
    setResult(null)
    checkScanStatus()
    showToast('Ready for new analysis', 'info', { duration: 2000 })
  }, [showToast])

  const isPremium = subscription?.hasPremium
  const hasNoScansRemaining = scanStatus && !scanStatus.canScan && scanStatus.tier === 'free'

  // Show analysis loading state
  if (isAnalyzing) {
    return <AnalysisLoadingSkeleton />
  }

  // Show results view
  if (result) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <AnalysisResults 
            result={result} 
            onReset={handleReset} 
            isPremium={isPremium}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section - Mobile optimized */}
      <section className="bg-gradient-to-br from-tcm-green to-emerald-800 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
              <Leaf className="w-8 h-8" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              What Does Your Tongue Reveal?
            </h1>
            <p className="text-lg sm:text-xl mb-6 text-emerald-100 leading-relaxed">
              Discover insights about your health through the ancient wisdom of 
              Traditional Chinese Medicine, powered by modern AI.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-emerald-200">
              <span className="flex items-center gap-1">
                <Sparkles size={14} />
                AI-Powered
              </span>
              <span className="flex items-center gap-1">
                <Shield size={14} />
                Private & Secure
              </span>
              <span className="flex items-center gap-1">
                <Leaf size={14} />
                TCM Expertise
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      {!isPremium && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <Link 
              href="/pricing" 
              className="flex items-center justify-center gap-2 text-amber-800 hover:text-amber-900 transition"
            >
              <Crown size={16} className="text-amber-600" />
              <span className="text-sm font-medium">
                {scanStatus?.scansToday && scanStatus.scansToday > 0 
                  ? 'Daily scan used - Upgrade for unlimited scans'
                  : 'Upgrade to Premium for unlimited scans + detailed reports'}
              </span>
              <Zap size={14} className="text-amber-600" />
            </Link>
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {isPremium && (
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
          <div className="max-w-2xl mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <Crown size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Premium Member - Unlimited Scans
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Section */}
      <section className="py-6 sm:py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Scan Status */}
          {!loadingStatus && scanStatus && scanStatus.tier === 'free' && (
            <div className={`mb-4 p-3 rounded-xl text-sm flex items-center justify-between ${
              scanStatus.canScan 
                ? 'bg-emerald-50 text-emerald-800' 
                : 'bg-amber-50 text-amber-800'
            }`}>
              <span className="flex items-center gap-2">
                {scanStatus.canScan ? (
                  <>
                    <Sparkles size={16} />
                    Free scan available today
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    Daily scan limit reached
                  </>
                )}
              </span>
              <Link 
                href="/pricing" 
                className="font-medium underline hover:no-underline"
              >
                Upgrade
              </Link>
            </div>
          )}

          {/* Image Upload/Preview */}
          <div className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 ${
            hasNoScansRemaining ? 'opacity-75' : ''
          }`}>
            {hasNoScansRemaining ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Daily Scan Limit Reached
                </h3>
                <p className="text-gray-600 mb-4">
                  You've used your free scan for today. Upgrade to Premium for unlimited scans!
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition"
                >
                  <Crown size={20} />
                  Upgrade to Premium
                </Link>
              </div>
            ) : (
              <>
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage}
                  onClear={handleClear}
                />

                {/* Analyze Button */}
                {selectedImage && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full py-4 px-6 bg-tcm-green text-white rounded-xl font-semibold text-lg 
                               hover:bg-tcm-green-dark active:scale-[0.98] transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center justify-center gap-3 shadow-lg
                               min-h-[56px] touch-manipulation"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={24} />
                          <span>Analyze My Tongue</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Takes about 10-15 seconds
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info cards */}
          {!selectedImage && !hasNoScansRemaining && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="w-10 h-10 bg-tcm-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera size={20} className="text-tcm-green" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">1. Snap a Photo</h3>
                <p className="text-sm text-gray-600">Take a clear photo of your tongue in natural light</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="w-10 h-10 bg-tcm-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={20} className="text-tcm-green" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">2. AI Analysis</h3>
                <p className="text-sm text-gray-600">Our AI analyzes coat, color, shape, and moisture</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="w-10 h-10 bg-tcm-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf size={20} className="text-tcm-green" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">3. Get Insights</h3>
                <p className="text-sm text-gray-600">Receive personalized TCM insights and recommendations</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Educational Section */}
      <section className="bg-white py-8 sm:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">About Tongue Diagnosis</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Why the Tongue?</h3>
              <p className="text-gray-600 text-sm">
                In Traditional Chinese Medicine, the tongue is considered a mirror of the body's internal health. 
                Different areas correspond to different organs - the tip reflects the heart, the center the digestive system, 
                the sides the liver and gallbladder, and the root the kidneys.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What We Look For</h3>
              <p className="text-gray-600 text-sm">
                TCM practitioners examine tongue body color (pale, red, purple), coating characteristics 
                (thickness, color, distribution), shape (swollen, thin, cracked), and moisture levels 
                to identify patterns of disharmony.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      {!isPremium && (
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Unlock Unlimited Scans
            </h2>
            <p className="text-emerald-100 mb-6">
              Upgrade to Premium for just $9.99/month and get unlimited tongue scans, 
              detailed PDF reports, and advanced pattern insights.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition"
            >
              <Zap size={20} />
              View Pricing Plans
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-2">© 2026 TCM Tongue Map. All rights reserved.</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            This app provides educational information only and is not a substitute for professional medical advice. 
            Always consult with a qualified healthcare provider before starting any treatment.
          </p>
        </div>
      </footer>
    </main>
  )
}
