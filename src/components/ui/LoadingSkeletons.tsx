'use client'

import React from 'react'

// Base skeleton with pulse animation
function SkeletonBase({ 
  className = '', 
  variant = 'default' 
}: { 
  className?: string
  variant?: 'default' | 'card' | 'circle' | 'text' | 'button'
}) {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 background-animate'
  
  const variantStyles = {
    default: 'rounded-lg',
    card: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded',
    button: 'rounded-xl',
  }

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s infinite',
      }}
    />
  )
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <section className="bg-gradient-to-br from-tcm-green to-emerald-800">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center">
          <SkeletonBase variant="circle" className="w-16 h-16 mx-auto mb-6 bg-white/20" />
          <SkeletonBase variant="text" className="h-10 w-3/4 mx-auto mb-4 bg-white/20" />
          <SkeletonBase variant="text" className="h-6 w-full mx-auto mb-2 bg-white/10" />
          <SkeletonBase variant="text" className="h-6 w-2/3 mx-auto mb-6 bg-white/10" />
          <div className="flex justify-center gap-4">
            <SkeletonBase variant="text" className="h-4 w-24 bg-white/10" />
            <SkeletonBase variant="text" className="h-4 w-24 bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

// Upload Area Skeleton
export function UploadSkeleton() {
  return (
    <div className="w-full space-y-4">
      <SkeletonBase variant="card" className="h-64 w-full" />
      <SkeletonBase variant="button" className="h-14 w-full" />
    </div>
  )
}

// Analysis Loading Skeleton - Full Page
export function AnalysisLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <SkeletonBase variant="circle" className="w-20 h-20 mx-auto mb-4" />
              {/* Animated pulse ring */}
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-tcm-green/30 border-t-tcm-green animate-spin" style={{ animationDuration: '1s' }} />
            </div>
            <SkeletonBase variant="text" className="h-8 w-48 mx-auto mb-2" />
            <SkeletonBase variant="text" className="h-4 w-64 mx-auto" />
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="relative">
                    <SkeletonBase variant="circle" className={`w-8 h-8 ${index === 0 ? 'bg-tcm-green/30' : ''}`} />
                    {index === 0 && (
                      <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-tcm-green border-t-transparent animate-spin" />
                    )}
                  </div>
                  <div className="flex-1">
                    <SkeletonBase variant="text" className="h-4 w-32 mb-1" />
                    <SkeletonBase variant="text" className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-tcm-green to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: '60%',
                    animation: 'progress-pulse 2s ease-in-out infinite',
                  }}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
                Analyzing your tongue... This may take 10-15 seconds
              </p>
            </div>
          </div>

          {/* Educational Tips */}
          <div className="bg-blue-50 rounded-xl p-4">
            <SkeletonBase variant="text" className="h-4 w-32 mb-3" />
            <div className="space-y-2">
              <SkeletonBase variant="text" className="h-3 w-full" />
              <SkeletonBase variant="text" className="h-3 w-5/6" />
              <SkeletonBase variant="text" className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Results Card Skeleton
export function ResultsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBase variant="circle" className="w-10 h-10" />
        <div className="flex-1">
          <SkeletonBase variant="text" className="h-4 w-24 mb-1" />
          <SkeletonBase variant="text" className="h-3 w-32" />
        </div>
      </div>
      <SkeletonBase variant="text" className="h-20 w-full" />
    </div>
  )
}

// Pattern Grid Skeleton
export function PatternGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <SkeletonBase variant="circle" className="w-10 h-10" />
            <div className="flex-1">
              <SkeletonBase variant="text" className="h-4 w-20 mb-2" />
              <SkeletonBase variant="text" className="h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Full Results Page Skeleton
export function ResultsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <SkeletonBase variant="circle" className="w-20 h-20 mx-auto mb-4" />
        <SkeletonBase variant="text" className="h-8 w-64 mx-auto mb-2" />
        <SkeletonBase variant="text" className="h-4 w-48 mx-auto" />
      </div>

      {/* Primary Pattern */}
      <SkeletonBase variant="card" className="h-40 w-full" />

      {/* Pattern Grid */}
      <PatternGridSkeleton />

      {/* Accordions */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <SkeletonBase key={i} variant="card" className="h-14 w-full" />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SkeletonBase variant="button" className="h-14 flex-1" />
        <SkeletonBase variant="button" className="h-14 flex-1" />
      </div>
    </div>
  )
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBase variant="text" className="h-8 w-48 mb-2" />
          <SkeletonBase variant="text" className="h-4 w-32" />
        </div>
        <SkeletonBase variant="circle" className="w-12 h-12" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBase key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SkeletonBase variant="text" className="h-6 w-32" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <SkeletonBase variant="circle" className="w-12 h-12" />
              <div className="flex-1">
                <SkeletonBase variant="text" className="h-4 w-32 mb-1" />
                <SkeletonBase variant="text" className="h-3 w-24" />
              </div>
              <SkeletonBase variant="text" className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Info Cards Skeleton
export function InfoCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center">
          <SkeletonBase variant="circle" className="w-10 h-10 mx-auto mb-3" />
          <SkeletonBase variant="text" className="h-4 w-24 mx-auto mb-1" />
          <SkeletonBase variant="text" className="h-3 w-full mx-auto" />
        </div>
      ))}
    </div>
  )
}

// Generic Content Skeleton
export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase 
          key={i} 
          variant="text" 
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  )
}

// Image Preview Skeleton
export function ImagePreviewSkeleton() {
  return (
    <div className="relative aspect-[4/3] max-h-[60vh] overflow-hidden rounded-2xl bg-gray-100">
      <SkeletonBase variant="card" className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-tcm-green/20 border-t-tcm-green animate-spin" />
          <p className="text-gray-500 text-sm">Processing image...</p>
        </div>
      </div>
    </div>
  )
}
