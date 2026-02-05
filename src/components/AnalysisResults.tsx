'use client'

import { 
  Leaf, 
  Droplets, 
  Heart, 
  Activity, 
  ShoppingBag, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  User,
  Sparkles,
  HelpCircle,
  Download,
  RefreshCw,
  Flame,
  Snowflake,
  Scale,
  Thermometer,
  Wind,
  Coffee,
  Moon,
  Sun,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

// Type definitions matching the new API response
interface EightPrinciples {
  exteriorInterior: { classification: string; confidence: number; evidence: string[] }
  hotCold: { classification: string; confidence: number; evidence: string[] }
  excessDeficiency: { classification: string; confidence: number; evidence: string[] }
  yinYang: { classification: string; confidence: number; evidence: string[] }
}

interface OrganDiagnosis {
  primaryOrgan: { organ: string; pathology: string; confidence: number }
  secondaryOrgans: Array<{ organ: string; pathology: string; confidence: number }>
}

interface Pattern {
  name: string
  chineseName: string
  chineseCharacters: string
  confidence: number
  severity?: string
  evidence?: string[]
  clinicalManifestations?: string[]
  relationshipToPrimary?: string
}

interface TongueZones {
  tip: { description: string; organCorrelation: string; findings: string[] }
  center: { description: string; organCorrelation: string; findings: string[] }
  root: { description: string; organCorrelation: string; findings: string[] }
  sides: { description: string; organCorrelation: string; findings: string[] }
}

interface TongueExamination {
  overallAssessment: { color: string; shape: string; moisture: string; movement?: string }
  coating: {
    color: string
    colorConfidence: number
    thickness: string
    thicknessConfidence: number
    moisture: string
    moistureConfidence: number
    distribution: string
    rooted: string
    description: string
  }
  body: {
    color: string
    colorConfidence: number
    shape: string
    shapeConfidence: number
    features: Array<{ type: string; location: string; description: string }>
    description: string
  }
  zones: TongueZones
}

interface HerbalFormula {
  recommended: { name: string; chineseName: string; chineseCharacters: string; confidence: number; rationale: string }
  modifications: Array<{ condition: string; add: string[]; remove: string[] }>
  alternatives: Array<{ name: string; whenToUse: string }>
}

interface Acupuncture {
  primaryPoints: Array<{ point: string; location: string; technique: string; rationale: string }>
  supplementaryPoints: Array<{ point: string; indication: string }>
  moxibustion: { recommended: boolean; points: string[]; rationale: string }
}

interface LifestyleRecommendations {
  diet: { general: string; foodsToEmphasize: string[]; foodsToAvoid: string[]; eatingHabits: string[] }
  exercise: { recommendedTypes: string[]; intensity: string; timing: string; cautions: string[] }
  emotionalHealth: { relevantEmotions: string[]; recommendations: string[] }
  sleep: { recommendations: string[]; idealHours: string }
  dailyRoutine: { morning: string[]; evening: string[] }
}

interface AnalysisResult {
  analysisMetadata?: { version: string; confidence: string; imageQuality: string; analysisTimestamp: string }
  eightPrinciples?: EightPrinciples
  zangFuDiagnosis?: OrganDiagnosis
  patternDifferentiation?: {
    primaryPattern: Pattern
    secondaryPatterns: Pattern[]
    differentialDiagnosis?: Array<{ pattern: string; rulingFactor: string }>
  }
  tongueExamination?: TongueExamination
  treatmentPrinciples?: { primary: string; secondary: string[]; contraindications: string[] }
  herbalFormula?: HerbalFormula
  acupuncture?: Acupuncture
  lifestyleRecommendations?: LifestyleRecommendations
  prognosis?: { expectedRecoveryTime: string; factorsAffectingRecovery: string[]; warningSigns: string[] }
  followUp?: { recommendedTimeline: string; expectedChanges: string[]; tongueChanges: string[] }
  // Legacy fields for backward compatibility
  primaryPattern?: string
  secondaryPatterns?: string[]
  coat?: string
  color?: string
  shape?: string
  moisture?: string
  recommendations?: string
  recommendedFormula?: string
  severity?: 'mild' | 'moderate' | 'significant'
  tongueZones?: { tip: string; center: string; root: string; sides: string }
  saved?: boolean
}

interface AnalysisResultsProps {
  result: AnalysisResult
  onReset: () => void
}

// Confidence score display component
function ConfidenceBadge({ score }: { score: number }) {
  let colorClass = 'bg-red-100 text-red-800'
  if (score >= 0.8) colorClass = 'bg-emerald-100 text-emerald-800'
  else if (score >= 0.6) colorClass = 'bg-amber-100 text-amber-800'
  else if (score >= 0.4) colorClass = 'bg-orange-100 text-orange-800'
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {(score * 100).toFixed(0)}% confidence
    </span>
  )
}

// Severity badge component
function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    mild: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    significant: 'bg-orange-100 text-orange-800 border-orange-300',
    severe: 'bg-red-100 text-red-800 border-red-300'
  }
  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-medium ${colors[severity] || colors.moderate}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
    </span>
  )
}

// Eight principles display
function EightPrinciplesCard({ principles }: { principles: EightPrinciples }) {
  const items = [
    { key: 'exteriorInterior', label: 'Exterior/Interior', icon: Scale, color: 'blue' },
    { key: 'hotCold', label: 'Hot/Cold', icon: Thermometer, color: 'orange' },
    { key: 'excessDeficiency', label: 'Excess/Deficiency', icon: Activity, color: 'purple' },
    { key: 'yinYang', label: 'Yin/Yang', icon: Sun, color: 'indigo' }
  ]
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const data = principles[item.key as keyof EightPrinciples]
        const Icon = item.icon
        return (
          <div key={item.key} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={`text-${item.color}-600`} />
              <span className="text-xs font-medium text-gray-600">{item.label}</span>
            </div>
            <p className="font-semibold text-gray-900 capitalize">{data.classification}</p>
            <div className="mt-1">
              <ConfidenceBadge score={data.confidence} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Organ diagnosis display
function OrganDiagnosisCard({ diagnosis }: { diagnosis: OrganDiagnosis }) {
  const organColors: Record<string, string> = {
    spleen: 'bg-yellow-100 text-yellow-800',
    liver: 'bg-green-100 text-green-800',
    kidney: 'bg-blue-100 text-blue-800',
    heart: 'bg-red-100 text-red-800',
    lung: 'bg-slate-100 text-slate-800',
    stomach: 'bg-orange-100 text-orange-800'
  }
  
  return (
    <div className="space-y-3">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Primary Affected Organ</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-emerald-900 capitalize">{diagnosis.primaryOrgan.organ}</p>
          <ConfidenceBadge score={diagnosis.primaryOrgan.confidence} />
        </div>
        <p className="text-sm text-emerald-700 capitalize mt-1">{diagnosis.primaryOrgan.pathology.replace(/_/g, ' ')}</p>
      </div>
      
      {diagnosis.secondaryOrgans.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Secondary Organs</p>
          <div className="flex flex-wrap gap-2">
            {diagnosis.secondaryOrgans.map((organ, idx) => (
              <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${organColors[organ.organ] || 'bg-gray-100 text-gray-800'}`}>
                {organ.organ} - {organ.pathology.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Tongue zone map component
function TongueZoneMap({ zones, activeZone, onZoneClick }: { 
  zones: TongueZones
  activeZone: string | null
  onZoneClick: (zone: string) => void
}) {
  const zoneInfo = [
    { id: 'tip', name: 'Tip', organ: 'Heart & Lungs', color: 'bg-red-100', borderColor: 'border-red-300', activeColor: 'bg-red-200' },
    { id: 'center', name: 'Center', organ: 'Spleen & Stomach', color: 'bg-amber-100', borderColor: 'border-amber-300', activeColor: 'bg-amber-200' },
    { id: 'root', name: 'Root', organ: 'Kidneys', color: 'bg-blue-100', borderColor: 'border-blue-300', activeColor: 'bg-blue-200' },
    { id: 'sides', name: 'Sides', organ: 'Liver & Gallbladder', color: 'bg-green-100', borderColor: 'border-green-300', activeColor: 'bg-green-200' },
  ]
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Visual Tongue Map */}
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 300" className="w-full max-w-[180px]">
          {/* Tongue Outline */}
          <ellipse cx="100" cy="150" rx="60" ry="100" fill="#e8c4c4" stroke="#d4a5a5" strokeWidth="2"/>
          {/* Tip Zone */}
          <ellipse 
            cx="100" cy="70" rx="40" ry="30" 
            fill={activeZone === 'tip' ? '#fecaca' : '#f8d7da'}
            stroke={activeZone === 'tip' ? '#ef4444' : 'transparent'}
            strokeWidth="3"
            className="cursor-pointer transition-all hover:brightness-95"
            onClick={() => onZoneClick('tip')}
          />
          {/* Center Zone */}
          <ellipse 
            cx="100" cy="150" rx="50" ry="50" 
            fill={activeZone === 'center' ? '#fde68a' : '#fef3c7'}
            stroke={activeZone === 'center' ? '#f59e0b' : 'transparent'}
            strokeWidth="3"
            className="cursor-pointer transition-all hover:brightness-95"
            onClick={() => onZoneClick('center')}
          />
          {/* Root Zone */}
          <ellipse 
            cx="100" cy="230" rx="45" ry="35" 
            fill={activeZone === 'root' ? '#bfdbfe' : '#dbeafe'}
            stroke={activeZone === 'root' ? '#3b82f6' : 'transparent'}
            strokeWidth="3"
            className="cursor-pointer transition-all hover:brightness-95"
            onClick={() => onZoneClick('root')}
          />
          {/* Left Side */}
          <ellipse 
            cx="55" cy="150" rx="20" ry="60" 
            fill={activeZone === 'sides' ? '#bbf7d0' : '#dcfce7'}
            stroke={activeZone === 'sides' ? '#22c55e' : 'transparent'}
            strokeWidth="3"
            className="cursor-pointer transition-all hover:brightness-95"
            onClick={() => onZoneClick('sides')}
          />
          {/* Right Side */}
          <ellipse 
            cx="145" cy="150" rx="20" ry="60" 
            fill={activeZone === 'sides' ? '#bbf7d0' : '#dcfce7'}
            stroke={activeZone === 'sides' ? '#22c55e' : 'transparent'}
            strokeWidth="3"
            className="cursor-pointer transition-all hover:brightness-95"
            onClick={() => onZoneClick('sides')}
          />
        </svg>
        <p className="text-center text-xs text-gray-500 mt-2">Tap zones to view analysis</p>
      </div>
      
      {/* Zone Information */}
      <div className="space-y-2">
        {zoneInfo.map((zone) => {
          const zoneData = zones[zone.id as keyof TongueZones]
          const isActive = activeZone === zone.id
          return (
            <button 
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                isActive ? `${zone.borderColor} ${zone.activeColor}` : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{zone.name}</span>
                  <span className="text-gray-500 text-xs ml-2">({zone.organ})</span>
                </div>
              </div>
              {isActive && zoneData && (
                <div className="mt-2 text-sm text-gray-700 animate-fadeIn">
                  <p className="mb-1">{zoneData.description}</p>
                  {zoneData.findings.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-2 space-y-0.5">
                      {zoneData.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Accordion section component
function AccordionSection({ 
  title, 
  children, 
  defaultOpen = false,
  icon: Icon
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ElementType
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-emerald-600" />}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </button>
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 bg-white border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  )
}

// Pattern card component
function PatternCard({ pattern, isPrimary = false }: { pattern: Pattern; isPrimary?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${isPrimary ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white' : 'bg-emerald-50 border border-emerald-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${isPrimary ? 'text-emerald-200' : 'text-emerald-600'}`}>
            {isPrimary ? 'Primary Pattern' : 'Secondary Pattern'}
          </p>
          <h3 className={`text-xl font-bold mt-1 ${isPrimary ? 'text-white' : 'text-emerald-900'}`}>
            {pattern.name}
          </h3>
          <p className={`text-sm ${isPrimary ? 'text-emerald-200' : 'text-emerald-700'}`}>
            {pattern.chineseName} • {pattern.chineseCharacters}
          </p>
        </div>
        <div className="text-right">
          <ConfidenceBadge score={pattern.confidence} />
          {pattern.severity && (
            <div className="mt-1">
              <SeverityBadge severity={pattern.severity} />
            </div>
          )}
        </div>
      </div>
      
      {pattern.evidence && pattern.evidence.length > 0 && (
        <div className={`mt-3 text-sm ${isPrimary ? 'text-emerald-100' : 'text-emerald-800'}`}>
          <p className="font-medium mb-1">Evidence:</p>
          <ul className="space-y-1">
            {pattern.evidence.map((e, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {pattern.clinicalManifestations && pattern.clinicalManifestations.length > 0 && (
        <div className={`mt-3 text-sm ${isPrimary ? 'text-emerald-100' : 'text-emerald-800'}`}>
          <p className="font-medium mb-1">Expected Symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {pattern.clinicalManifestations.map((sym, idx) => (
              <span key={idx} className={`px-2 py-0.5 rounded text-xs ${isPrimary ? 'bg-white/20' : 'bg-emerald-200 text-emerald-900'}`}>
                {sym}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main component
export default function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user } = useAuth()
  const [activeZone, setActiveZone] = useState<string | null>('center')

  // Helper to determine if using new format
  const hasNewFormat = !!result.patternDifferentiation
  
  // Get primary pattern (new or legacy format)
  const primaryPattern = result.patternDifferentiation?.primaryPattern || {
    name: result.primaryPattern || 'Qi Deficiency Pattern',
    chineseName: '',
    chineseCharacters: '',
    confidence: 0.7
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl mb-4 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-serif">
          TCM Tongue Diagnosis Report
        </h2>
        <p className="text-gray-600">中医舌诊报告 • Comprehensive Analysis</p>
        
        {result.analysisMetadata && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">v{result.analysisMetadata.version}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{result.analysisMetadata.imageQuality} image</span>
            <span className="bg-gray-100 px-2 py-1 rounded capitalize">{result.analysisMetadata.confidence} confidence</span>
          </div>
        )}
      </div>

      {/* User notifications */}
      {user && result.saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-emerald-700 flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Saved to your history</span>
          </p>
          <Link href="/dashboard" className="text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1">
            <User size={16} />
            View Dashboard
          </Link>
        </div>
      )}

      {!user && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
          <h3 className="font-semibold text-emerald-800 mb-2">Track Your Health Journey</h3>
          <p className="text-gray-600 text-sm mb-3">Create a free account to save scans and monitor tongue changes over time.</p>
          <div className="flex gap-3">
            <Link href="/signup" className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition">
              Create Free Account
            </Link>
            <Link href="/login" className="bg-white text-emerald-700 border border-emerald-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition">
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Primary Pattern */}
      <PatternCard pattern={primaryPattern} isPrimary={true} />

      {/* Secondary Patterns */}
      {result.patternDifferentiation?.secondaryPatterns && result.patternDifferentiation.secondaryPatterns.length > 0 && (
        <div className="space-y-3">
          {result.patternDifferentiation.secondaryPatterns.map((pattern, idx) => (
            <PatternCard key={idx} pattern={pattern} />
          ))}
        </div>
      )}

      {/* Eight Principles & Zang-Fu Diagnosis */}
      {hasNewFormat && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.eightPrinciples && (
            <AccordionSection title="Eight Principles (八纲)" icon={Scale}>
              <EightPrinciplesCard principles={result.eightPrinciples} />
            </AccordionSection>
          )}
          
          {result.zangFuDiagnosis && (
            <AccordionSection title="Organ Diagnosis (脏腑)" icon={Activity}>
              <OrganDiagnosisCard diagnosis={result.zangFuDiagnosis} />
            </AccordionSection>
          )}
        </div>
      )}

      {/* Tongue Examination Details */}
      {result.tongueExamination && (
        <AccordionSection title="Detailed Tongue Examination" defaultOpen={true} icon={Info}>
          <div className="space-y-4">
            {/* Overall Assessment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Body Color</p>
                <p className="font-medium text-gray-900">{result.tongueExamination.body.color}</p>
                <ConfidenceBadge score={result.tongueExamination.body.colorConfidence} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Shape</p>
                <p className="font-medium text-gray-900">{result.tongueExamination.body.shape}</p>
                <ConfidenceBadge score={result.tongueExamination.body.shapeConfidence} />
              </div>
            </div>

            {/* Coating Analysis */}
            <div className="bg-amber-50 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Droplets size={18} />
                Coating Analysis (舌苔)
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-amber-700 mb-1">Color</p>
                  <p className="text-sm font-medium text-amber-900 capitalize">{result.tongueExamination.coating.color}</p>
                  <ConfidenceBadge score={result.tongueExamination.coating.colorConfidence} />
                </div>
                <div>
                  <p className="text-xs text-amber-700 mb-1">Thickness</p>
                  <p className="text-sm font-medium text-amber-900 capitalize">{result.tongueExamination.coating.thickness}</p>
                  <ConfidenceBadge score={result.tongueExamination.coating.thicknessConfidence} />
                </div>
                <div>
                  <p className="text-xs text-amber-700 mb-1">Moisture</p>
                  <p className="text-sm font-medium text-amber-900 capitalize">{result.tongueExamination.coating.moisture}</p>
                  <ConfidenceBadge score={result.tongueExamination.coating.moistureConfidence} />
                </div>
                <div>
                  <p className="text-xs text-amber-700 mb-1">Root</p>
                  <p className="text-sm font-medium text-amber-900 capitalize">{result.tongueExamination.coating.rooted}</p>
                </div>
              </div>
              <p className="text-sm text-amber-800">{result.tongueExamination.coating.description}</p>
            </div>

            {/* Tongue Features */}
            {result.tongueExamination.body.features.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Notable Features</h4>
                <div className="space-y-2">
                  {result.tongueExamination.body.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <div>
                        <span className="font-medium capitalize">{feature.type.replace(/_/g, ' ')}</span>
                        <span className="text-blue-600"> on {feature.location}</span>
                        <p className="text-blue-700 text-xs mt-0.5">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Tongue Zone Map */}
      {result.tongueExamination?.zones && (
        <AccordionSection title="Tongue Zone Map (舌分区)" defaultOpen={true} icon={Activity}>
          <TongueZoneMap 
            zones={result.tongueExamination.zones}
            activeZone={activeZone}
            onZoneClick={(zone) => setActiveZone(activeZone === zone ? null : zone)}
          />
        </AccordionSection>
      )}

      {/* Treatment Principles */}
      {result.treatmentPrinciples && (
        <AccordionSection title="Treatment Principles (治则)" icon={TrendingUp}>
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Primary Strategy</p>
              <p className="text-lg font-semibold text-emerald-900">{result.treatmentPrinciples.primary}</p>
            </div>
            
            {result.treatmentPrinciples.secondary.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Supporting Strategies</p>
                <ul className="space-y-1">
                  {result.treatmentPrinciples.secondary.map((strategy, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-500">◦</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.treatmentPrinciples.contraindications.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-1 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Contraindications
                </p>
                <ul className="space-y-1">
                  {result.treatmentPrinciples.contraindications.map((item, idx) => (
                    <li key={idx} className="text-sm text-red-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Herbal Formula */}
      {result.herbalFormula && (
        <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <p className="text-sm font-medium text-amber-200 uppercase tracking-wide">Recommended Herbal Formula</p>
          </div>
          
          <h3 className="text-2xl font-bold mb-1">{result.herbalFormula.recommended.name}</h3>
          <p className="text-lg text-amber-200 mb-1">{result.herbalFormula.recommended.chineseName}</p>
          <p className="text-xl text-amber-300 font-serif mb-4">{result.herbalFormula.recommended.chineseCharacters}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <ConfidenceBadge score={result.herbalFormula.recommended.confidence} />
          </div>
          
          <p className="text-sm text-amber-100 mb-4 bg-white/10 rounded-lg p-3">
            <span className="font-medium text-amber-200">Rationale:</span> {result.herbalFormula.recommended.rationale}
          </p>

          {/* Modifications */}
          {result.herbalFormula.modifications.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-amber-200 mb-2">Modifications</p>
              {result.herbalFormula.modifications.map((mod, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-3 mb-2">
                  <p className="text-sm text-amber-200 font-medium">{mod.condition}</p>
                  {mod.add.length > 0 && (
                    <p className="text-xs text-amber-100 mt-1">Add: {mod.add.join(', ')}</p>
                  )}
                  {mod.remove.length > 0 && (
                    <p className="text-xs text-amber-100 mt-1">Remove: {mod.remove.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Alternatives */}
          {result.herbalFormula.alternatives.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-200 mb-2">Alternative Formulas</p>
              <div className="flex flex-wrap gap-2">
                {result.herbalFormula.alternatives.map((alt, idx) => (
                  <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-xs" title={alt.whenToUse}>
                    {alt.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Acupuncture */}
      {result.acupuncture && (
        <AccordionSection title="Acupuncture & Moxibustion" icon={Activity}>
          <div className="space-y-4">
            {result.acupuncture.primaryPoints.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Primary Points</p>
                <div className="space-y-2">
                  {result.acupuncture.primaryPoints.map((point, idx) => (
                    <div key={idx} className="bg-emerald-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-emerald-900">{point.point}</span>
                        <span className="text-xs text-emerald-600 capitalize">{point.technique} technique</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{point.location}</p>
                      <p className="text-xs text-emerald-700">{point.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.acupuncture.moxibustion.recommended && (
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-800 mb-1 flex items-center gap-2">
                  <Flame size={16} />
                  Moxibustion Recommended
                </p>
                <p className="text-xs text-orange-700">Points: {result.acupuncture.moxibustion.points.join(', ')}</p>
                <p className="text-xs text-orange-600 mt-1">{result.acupuncture.moxibustion.rationale}</p>
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Lifestyle Recommendations */}
      {result.lifestyleRecommendations && (
        <AccordionSection title="Lifestyle Recommendations" icon={Heart}>
          <div className="space-y-4">
            {/* Diet */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Coffee size={18} />
                Dietary Guidelines
              </h4>
              <p className="text-sm text-green-800 mb-3">{result.lifestyleRecommendations.diet.general}</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">Foods to Emphasize</p>
                  <div className="flex flex-wrap gap-1">
                    {result.lifestyleRecommendations.diet.foodsToEmphasize.map((food, idx) => (
                      <span key={idx} className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">{food}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-700 mb-1">Foods to Avoid</p>
                  <div className="flex flex-wrap gap-1">
                    {result.lifestyleRecommendations.diet.foodsToAvoid.map((food, idx) => (
                      <span key={idx} className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs">{food}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise & Sleep */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Activity size={16} />
                  Exercise
                </h4>
                <p className="text-sm text-blue-800 capitalize mb-1">{result.lifestyleRecommendations.exercise.intensity} intensity</p>
                <p className="text-xs text-blue-700">{result.lifestyleRecommendations.exercise.timing}</p>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-3">
                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <Moon size={16} />
                  Sleep
                </h4>
                <p className="text-sm text-indigo-800">{result.lifestyleRecommendations.sleep.idealHours}</p>
              </div>
            </div>
          </div>
        </AccordionSection>
      )}

      {/* Prognosis & Follow-up */}
      {(result.prognosis || result.followUp) && (
        <AccordionSection title="Prognosis & Follow-up" icon={Calendar}>
          <div className="space-y-4">
            {result.prognosis && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Expected Recovery</h4>
                <p className="text-sm text-blue-800 mb-2">{result.prognosis.expectedRecoveryTime}</p>
                
                {result.prognosis.warningSigns.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Warning Signs - Seek Care If:
                    </p>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {result.prognosis.warningSigns.map((sign, idx) => (
                        <li key={idx}>• {sign}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.followUp && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Follow-up Schedule</h4>
                <p className="text-sm text-emerald-800">{result.followUp.recommendedTimeline}</p>
                
                {result.followUp.tongueChanges.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Expected Tongue Changes:</p>
                    <ul className="text-xs text-emerald-600 space-y-0.5">
                      {result.followUp.tongueChanges.map((change, idx) => (
                        <li key={idx}>• {change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Legacy recommendations (if new format not available) */}
      {!hasNewFormat && result.recommendations && (
        <AccordionSection title="Recommendations" icon={BookOpen}>
          <p className="text-sm text-gray-700 leading-relaxed">{result.recommendations}</p>
        </AccordionSection>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <HelpCircle size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
        <div>
          <p className="font-semibold mb-1">Important Medical Disclaimer</p>
          <p>
            This analysis is for educational purposes only and should not replace professional medical advice. 
            TCM diagnosis requires a comprehensive assessment by a qualified practitioner. Always consult with a 
            licensed TCM practitioner or healthcare provider for proper diagnosis and treatment.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-4 px-6 bg-emerald-700 text-white rounded-xl font-semibold text-lg 
                     hover:bg-emerald-800 active:scale-[0.98] transition-all duration-200
                     flex items-center justify-center gap-2 touch-manipulation shadow-lg"
        >
          <RefreshCw size={20} />
          Analyze Another Photo
        </button>
        <button className="py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold 
                          hover:bg-gray-50 active:scale-[0.98] transition-all duration-200
                          flex items-center justify-center gap-2 touch-manipulation">
          <Download size={20} />
          Save Report
        </button>
      </div>
    </div>
  )
}
