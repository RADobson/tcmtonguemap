'use client'

import { useState, useCallback } from 'react'
import { Upload, Camera, Loader2, Sparkles, Shield, Leaf } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'
import AnalysisResults from '@/components/AnalysisResults'
import { compressImageForMobile } from '@/lib/imageCompression'

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

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = useCallback(async (imageData: string) => {
    setSelectedImage(imageData)
    setResult(null)
    setError(null)
  }, [])

  const handleClear = useCallback(() => {
    setSelectedImage(null)
    setResult(null)
    setError(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Get connection info for adaptive compression
      const connection = (navigator as any).connection
      const connectionType = connection?.effectiveType
      
      // Compress image before sending
      let imageToSend = selectedImage
      
      // If it's a data URL from a large file, we might want to compress further
      // But for now, the ImageUploader already compresses it
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageToSend }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const data = await response.json()
      setResult(data)
      
      // Scroll to results on mobile
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedImage])

  const handleReset = useCallback(() => {
    setSelectedImage(null)
    setResult(null)
    setError(null)
  }, [])

  // Show results view
  if (result) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <AnalysisResults result={result} onReset={handleReset} />
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

      {/* Main Upload Section */}
      <section className="py-6 sm:py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <p className="font-medium">Analysis Error</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm underline touch-manipulation"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Image Upload/Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
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
          </div>

          {/* Info cards */}
          {!selectedImage && (
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
