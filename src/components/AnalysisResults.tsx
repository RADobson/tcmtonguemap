'use client'

import { Leaf, Droplets, Circle, Waves, ShoppingBag, Info, ChevronDown, ChevronUp, Save, CheckCircle, User } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

interface AnalysisResult {
  primaryPattern: string
  coat: string
  color: string
  shape: string
  moisture: string
  recommendations?: string
  recommendedFormula: string
  saved?: boolean
}

interface AnalysisResultsProps {
  result: AnalysisResult
  onReset: () => void
}

function PatternCard({ 
  title, 
  value, 
  icon: Icon, 
  colorClass, 
  bgClass 
}: { 
  title: string
  value: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`${bgClass} rounded-xl p-4 transition-all duration-200`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass} bg-white/50`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${colorClass} mb-1`}>{title}</h4>
          <p className="text-sm text-gray-700">{value || 'Analyzed'}</p>
        </div>
      </div>
    </div>
  )
}

function AccordionSection({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors touch-manipulation"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

export default function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <Leaf className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Your TCM Analysis
        </h2>
        <p className="text-gray-600">Based on your tongue diagnosis</p>
      </div>

      {/* Saved notification for logged-in users */}
      {user && result.saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-emerald-700 flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Saved to your history</span>
          </p>
          <Link 
            href="/dashboard" 
            className="text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1"
          >
            <User size={16} />
            View Dashboard
          </Link>
        </div>
      )}

      {/* Sign up prompt for anonymous users */}
      {!user && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="font-semibold text-emerald-900 mb-2">Want to track your health journey?</h3>
          <p className="text-emerald-700 text-sm mb-3">
            Create a free account to save your scans and see how your tongue health changes over time.
          </p>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="bg-tcm-green text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition touch-manipulation"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="bg-white text-tcm-green border border-tcm-green px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition touch-manipulation"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Primary Pattern - Highlighted */}
      <div className="bg-gradient-to-br from-tcm-green to-emerald-800 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-sm font-medium text-emerald-200 uppercase tracking-wide mb-2">
          Primary Pattern
        </h3>
        <p className="text-2xl sm:text-3xl font-bold mb-3">
          {result.primaryPattern || 'Analysis Complete'}
        </p>
        <p className="text-emerald-100 text-sm">
          This is the main TCM pattern identified from your tongue analysis.
        </p>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PatternCard
          title="Tongue Coat"
          value={result.coat}
          icon={Droplets}
          colorClass="text-amber-700"
          bgClass="bg-amber-50"
        />
        <PatternCard
          title="Body Color"
          value={result.color}
          icon={Circle}
          colorClass="text-rose-700"
          bgClass="bg-rose-50"
        />
        <PatternCard
          title="Shape"
          value={result.shape}
          icon={Waves}
          colorClass="text-blue-700"
          bgClass="bg-blue-50"
        />
        <PatternCard
          title="Moisture"
          value={result.moisture}
          icon={Droplets}
          colorClass="text-purple-700"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Educational Content */}
      <AccordionSection title="What does this mean?" defaultOpen={true}>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            In Traditional Chinese Medicine, the tongue is considered a mirror of the body's internal health. 
            Different areas of the tongue correspond to different organs and systems.
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-medium text-amber-800 mb-1">⚠️ Important Note</p>
            <p>
              This analysis is for educational purposes only and should not replace professional medical advice. 
              Always consult with a qualified TCM practitioner or healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Recommendations */}
      {result.recommendations && (
        <AccordionSection title="Wellness Recommendations">
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>{result.recommendations}</p>
          </div>
        </AccordionSection>
      )}

      {/* Herbal Formula Recommendation */}
      <div className="bg-gradient-to-r from-tcm-brown to-amber-700 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Recommended Herbal Formula</h3>
            <p className="text-xl font-bold mb-2">{result.recommendedFormula || 'Custom TCM Formula'}</p>
            <p className="text-amber-100 text-sm mb-4">
              Based on your tongue diagnosis, this traditional formula may help address the identified patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-white text-tcm-brown px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 active:scale-[0.98] transition-all touch-manipulation">
                Shop Now
              </button>
              <button className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 active:scale-[0.98] transition-all touch-manipulation">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
        <Info size={18} className="flex-shrink-0 mt-0.5" />
        <p>
          This app provides educational information about Traditional Chinese Medicine tongue diagnosis. 
          It is not intended to diagnose, treat, cure, or prevent any disease. 
          Consult a qualified healthcare provider before starting any herbal regimen.
        </p>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg 
                   hover:bg-gray-50 active:scale-[0.98] transition-all duration-200
                   flex items-center justify-center gap-2 touch-manipulation"
      >
        Analyze Another Photo
      </button>
    </div>
  )
}
