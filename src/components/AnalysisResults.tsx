'use client'

import { 
  Leaf, 
  Droplets, 
  Circle, 
  Waves, 
  ShoppingBag, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  CheckCircle, 
  User,
  Heart,
  Activity,
  BookOpen,
  Sparkles,
  HelpCircle,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

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

interface AnalysisResultsProps {
  result: AnalysisResult
  onReset: () => void
}

// TCM Educational Content
const tcmPrinciples = [
  {
    id: 'coat',
    title: 'Tongue Coat (苔 - Tāi)',
    icon: Droplets,
    description: 'The coating reflects the state of the digestive system and the presence of pathogenic factors.',
    details: [
      { type: 'Thin White Coat', meaning: 'Normal or mild condition' },
      { type: 'Thick Coat', meaning: 'Dampness, phlegm, or food stagnation' },
      { type: 'Yellow Coat', meaning: 'Heat or inflammation present' },
      { type: 'No Coat (Peeled)', meaning: 'Yin deficiency, stomach yin damage' },
    ]
  },
  {
    id: 'color',
    title: 'Body Color (质 - Zhì)',
    icon: Heart,
    description: 'The tongue body color indicates the state of blood, qi, and internal organs.',
    details: [
      { type: 'Pale/Pink', meaning: 'Normal or qi/blood deficiency' },
      { type: 'Red', meaning: 'Heat pattern present' },
      { type: 'Purple/Blue', meaning: 'Blood stasis or cold' },
    ]
  },
  {
    id: 'shape',
    title: 'Tongue Shape (形 - Xíng)',
    icon: Activity,
    description: 'Shape and texture reveal organ function and fluid metabolism.',
    details: [
      { type: 'Swollen/Tender', meaning: 'Fluid retention, spleen qi deficiency' },
      { type: 'Thin/Emaciated', meaning: 'Blood or yin deficiency' },
      { type: 'Teeth Marks', meaning: 'Spleen qi deficiency with dampness' },
      { type: 'Cracks/Fissures', meaning: 'Yin deficiency, dryness' },
    ]
  },
]

// Tongue Zone Data
const tongueZones = [
  { id: 'tip', name: 'Tip', organ: 'Heart & Lungs', color: 'bg-red-100', borderColor: 'border-red-300' },
  { id: 'center', name: 'Center', organ: 'Spleen & Stomach', color: 'bg-amber-100', borderColor: 'border-amber-300' },
  { id: 'root', name: 'Root', organ: 'Kidneys', color: 'bg-blue-100', borderColor: 'border-blue-300' },
  { id: 'sides', name: 'Sides', organ: 'Liver & Gallbladder', color: 'bg-green-100', borderColor: 'border-green-300' },
]

// Herbal Formula Database
const herbalFormulas: { [key: string]: { chinese: string; ingredients: string[]; benefits: string[]; lifestyle: string } } = {
  'Spleen Qi Deficiency': {
    chinese: '四君子汤',
    ingredients: ['Ren Shen (Ginseng)', 'Bai Zhu (Atractylodes)', 'Fu Ling (Poria)', 'Zhi Gan Cao (Licorice)'],
    benefits: ['Strengthens digestion', 'Boosts energy', 'Improves absorption'],
    lifestyle: 'Eat warm, cooked foods. Avoid cold drinks and raw foods.',
  },
  'Liver Qi Stagnation': {
    chinese: '逍遥散',
    ingredients: ['Chai Hu (Bupleurum)', 'Bai Shao (White Peony)', 'Dang Gui (Angelica)'],
    benefits: ['Relieves stress', 'Regulates emotions', 'Improves digestion'],
    lifestyle: 'Practice deep breathing. Regular exercise. Express emotions.',
  },
  'Damp-Heat': {
    chinese: '三仁汤',
    ingredients: ['Xing Ren (Apricot Seed)', 'Bai Dou Kou (Cardamom)', 'Yi Yi Ren (Coix Seed)'],
    benefits: ['Clears dampness', 'Reduces inflammation', 'Improves metabolism'],
    lifestyle: 'Avoid greasy, fried foods. Stay hydrated. Light exercise.',
  },
  'Blood Deficiency': {
    chinese: '四物汤',
    ingredients: ['Dang Gui (Angelica)', 'Chuan Xiong (Ligusticum)', 'Bai Shao (White Peony)'],
    benefits: ['Nourishes blood', 'Improves circulation', 'Enhances complexion'],
    lifestyle: 'Eat blood-nourishing foods like beets and spinach.',
  },
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
  return (
    <div className={`${bgClass} rounded-xl p-4 transition-all duration-200 hover:shadow-md border border-opacity-20 ${colorClass.replace('text-', 'border-')}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass} bg-white/60`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${colorClass} mb-1 text-sm`}>{title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{value || 'Analyzed'}</p>
        </div>
      </div>
    </div>
  )
}

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
          {Icon && <Icon size={20} className="text-tcm-green" />}
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

function TongueZoneMap({ zones, activeZone, onZoneClick }: { 
  zones?: AnalysisResult['tongueZones']
  activeZone: string | null
  onZoneClick: (zone: string) => void
}) {
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
        {tongueZones.map((zone) => (
          <button 
            key={zone.id}
            onClick={() => onZoneClick(zone.id)}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              activeZone === zone.id 
                ? `${zone.borderColor} ${zone.color}` 
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900 text-sm">{zone.name}</span>
                <span className="text-gray-500 text-xs ml-2">({zone.organ})</span>
              </div>
            </div>
            {activeZone === zone.id && zones?.[zone.id as keyof typeof zones] && (
              <p className="text-sm text-gray-700 mt-2 animate-fadeIn">
                {zones[zone.id as keyof typeof zones]}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user } = useAuth()
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>('coat')

  const getSeverityBadge = () => {
    const severity = result.severity || 'mild'
    const colors = {
      mild: 'bg-green-100 text-green-800 border-green-300',
      moderate: 'bg-amber-100 text-amber-800 border-amber-300',
      significant: 'bg-red-100 text-red-800 border-red-300',
    }
    return (
      <span className={`px-3 py-1 rounded-full border text-xs font-medium ${colors[severity]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)} Condition
      </span>
    )
  }

  const getFormulaInfo = () => {
    const key = Object.keys(herbalFormulas).find(k => 
      result.primaryPattern?.toLowerCase().includes(k.toLowerCase()) ||
      result.recommendedFormula?.toLowerCase().includes(k.toLowerCase())
    )
    return key ? herbalFormulas[key] : null
  }

  const formulaInfo = getFormulaInfo()

  return (
    <div className="space-y-6">
      {/* Header with TCM Seal */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-tcm-green to-emerald-700 rounded-2xl mb-4 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-serif">
          TCM Tongue Diagnosis Report
        </h2>
        <p className="text-gray-600">中医舌诊报告 • Comprehensive Analysis</p>
        <div className="mt-3">{getSeverityBadge()}</div>
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
        <div className="bg-gradient-to-r from-tcm-green/5 to-emerald-50 border border-tcm-green/20 rounded-xl p-4">
          <h3 className="font-semibold text-tcm-green mb-2">Track Your Health Journey</h3>
          <p className="text-gray-600 text-sm mb-3">
            Create a free account to save scans and monitor changes over time.
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
      <div className="bg-gradient-to-br from-tcm-green via-emerald-700 to-tcm-green-dark text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-emerald-300" />
            <h3 className="text-sm font-medium text-emerald-200 uppercase tracking-wide">
              Primary Pattern Identified
            </h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-3 font-serif">
            {result.primaryPattern || 'Analysis Complete'}
          </p>
          {result.secondaryPatterns && result.secondaryPatterns.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.secondaryPatterns.map((pattern, idx) => (
                <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {pattern}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PatternCard
          title="Tongue Coating (苔)"
          value={result.coat}
          icon={Droplets}
          colorClass="text-amber-700"
          bgClass="bg-amber-50"
        />
        <PatternCard
          title="Body Color (质)"
          value={result.color}
          icon={Heart}
          colorClass="text-rose-700"
          bgClass="bg-rose-50"
        />
        <PatternCard
          title="Shape (形)"
          value={result.shape}
          icon={Activity}
          colorClass="text-blue-700"
          bgClass="bg-blue-50"
        />
        <PatternCard
          title="Moisture Level"
          value={result.moisture}
          icon={Droplets}
          colorClass="text-purple-700"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Tongue Zone Analysis */}
      {result.tongueZones && (
        <AccordionSection title="Tongue Zone Map Analysis" defaultOpen={true} icon={Info}>
          <TongueZoneMap 
            zones={result.tongueZones} 
            activeZone={activeZone}
            onZoneClick={(zone) => setActiveZone(activeZone === zone ? null : zone)}
          />
        </AccordionSection>
      )}

      {/* TCM Educational Content */}
      <AccordionSection title="Understanding Your Diagnosis" icon={BookOpen}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            In Traditional Chinese Medicine, the tongue is considered a mirror of the body's internal health. 
            Each aspect of your tongue tells a story about your organs and overall wellness.
          </p>
          
          <div className="space-y-3">
            {tcmPrinciples.map((principle) => (
              <div key={principle.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedPrinciple(expandedPrinciple === principle.id ? null : principle.id)}
                  className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <principle.icon size={18} className="text-tcm-green" />
                    <span className="font-medium text-sm">{principle.title}</span>
                  </div>
                  {expandedPrinciple === principle.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedPrinciple === principle.id && (
                  <div className="p-3 bg-white border-t text-sm">
                    <p className="text-gray-600 mb-3">{principle.description}</p>
                    <div className="space-y-2">
                      {principle.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <span className="w-2 h-2 bg-tcm-gold rounded-full mt-1.5 flex-shrink-0"></span>
                          <div>
                            <span className="font-medium text-gray-800">{detail.type}:</span>
                            <span className="text-gray-600 ml-1">{detail.meaning}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* Recommendations */}
      {result.recommendations && (
        <AccordionSection title="Wellness Recommendations" icon={Leaf}>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>{result.recommendations}</p>
          </div>
        </AccordionSection>
      )}

      {/* Herbal Formula Recommendation */}
      <div className="bg-gradient-to-br from-tcm-brown to-amber-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-200 uppercase tracking-wide mb-1">
                Recommended Herbal Formula
              </h3>
              <p className="text-xl sm:text-2xl font-bold mb-1 font-serif">
                {result.recommendedFormula || 'Custom TCM Formula'}
              </p>
              {formulaInfo && (
                <p className="text-lg text-amber-200 mb-4">{formulaInfo.chinese}</p>
              )}
              
              {formulaInfo && (
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-200 mb-2">Key Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formulaInfo.ingredients.map((ing, idx) => (
                        <span key={idx} className="bg-white/20 px-2 py-1 rounded text-xs">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-amber-200 mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {formulaInfo.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-amber-100 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-300 rounded-full"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-amber-200 mb-1">Lifestyle Tips:</h4>
                    <p className="text-sm text-amber-100">{formulaInfo.lifestyle}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button className="flex-1 bg-white text-tcm-brown px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2">
                  <Leaf size={18} />
                  Find Practitioners
                </button>
                <button className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2">
                  <BookOpen size={18} />
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <HelpCircle size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
        <div>
          <p className="font-semibold mb-1">Important Medical Disclaimer</p>
          <p>
            This analysis is for educational purposes only and should not replace professional medical advice. 
            Always consult with a qualified TCM practitioner or healthcare provider for proper diagnosis and treatment.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-4 px-6 bg-tcm-green text-white rounded-xl font-semibold text-lg 
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
