'use client'

import { AnalysisLoadingSkeleton } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tcm-green to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
