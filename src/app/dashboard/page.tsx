'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  LogOut, 
  User, 
  History, 
  Calendar, 
  ChevronRight,
  Scan,
  Leaf,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'

interface TongueScan {
  id: string
  created_at: string
  image_url: string | null
  primary_pattern: string
  coat: string
  color: string
  shape: string
  moisture: string
  recommendations: string
  recommended_formula: string
}

// Mock data for demo
const mockScans: TongueScan[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    image_url: null,
    primary_pattern: 'Spleen Qi Deficiency',
    coat: 'Thin white coating, slightly thicker in the center',
    color: 'Pale pink tongue body',
    shape: 'Slightly swollen with tooth marks on the sides',
    moisture: 'Moist, slightly wet',
    recommendations: 'Eat warm, cooked foods. Avoid cold drinks and raw foods. Consider gentle exercise like walking or tai chi.',
    recommended_formula: 'Bu Zhong Yi Qi Tang'
  }
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>({ email: 'user@example.com' })
  const [scans, setScans] = useState<TongueScan[]>(mockScans)
  const [loading, setLoading] = useState(false)
  const [selectedScan, setSelectedScan] = useState<TongueScan | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    router.push('/')
    router.refresh()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-tcm-green" size={48} />
      </div>
    )
  }

  // Mobile scan detail view
  if (selectedScan && typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-white border-b safe-area-top">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setSelectedScan(null)}
              className="flex items-center gap-2 text-gray-600 -ml-2 p-2 touch-manipulation"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <span className="font-semibold text-gray-900">Analysis Details</span>
            <div className="w-16" />
          </div>
        </header>

        <div className="p-4 space-y-4 safe-area-bottom">
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">{formatDate(selectedScan.created_at)}</p>
          </div>

          <div className="bg-gradient-to-br from-tcm-green to-emerald-800 text-white p-5 rounded-2xl">
            <h3 className="text-sm font-medium text-emerald-200 uppercase tracking-wide mb-1">Primary Pattern</h3>
            <p className="text-xl font-bold">{selectedScan.primary_pattern}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 p-4 rounded-xl">
              <h4 className="font-medium text-amber-800 mb-1 text-sm">Tongue Coat</h4>
              <p className="text-sm text-gray-600">{selectedScan.coat}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl">
              <h4 className="font-medium text-rose-800 mb-1 text-sm">Body Color</h4>
              <p className="text-sm text-gray-600">{selectedScan.color}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-medium text-blue-800 mb-1 text-sm">Shape</h4>
              <p className="text-sm text-gray-600">{selectedScan.shape}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <h4 className="font-medium text-purple-800 mb-1 text-sm">Moisture</h4>
              <p className="text-sm text-gray-600">{selectedScan.moisture}</p>
            </div>
          </div>

          {selectedScan.recommendations && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
              <p className="text-gray-600 text-sm">{selectedScan.recommendations}</p>
            </div>
          )}

          {selectedScan.recommended_formula && (
            <div className="bg-gradient-to-r from-tcm-brown to-amber-700 text-white p-5 rounded-xl">
              <h4 className="font-medium mb-1">Recommended Formula</h4>
              <p className="text-lg font-bold mb-2">{selectedScan.recommended_formula}</p>
              <button className="w-full bg-white text-tcm-brown py-3 rounded-lg font-semibold active:scale-[0.98] transition-transform touch-manipulation mt-2">
                Shop Now
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm border-b safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-tcm-green" />
                <span className="text-lg font-bold text-tcm-green hidden sm:inline">TCM Tongue Map</span>
              </Link>
            </div>
            
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition touch-manipulation"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden flex items-center p-2 -mr-2 touch-manipulation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full py-2 touch-manipulation"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 safe-area-bottom">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track your tongue health journey
          </p>
        </div>

        {/* Quick Actions - Horizontal scroll on mobile */}
        <div className="flex gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 scrollbar-hide">
          <Link
            href="/"
            className="flex-shrink-0 w-[280px] sm:w-auto bg-tcm-green text-white p-4 sm:p-6 rounded-xl hover:bg-tcm-green-dark active:scale-[0.98] transition-all flex items-center gap-3 sm:gap-4 touch-manipulation"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scan size={20} className="sm:hidden" />
              <Scan size={24} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg">New Scan</h3>
              <p className="text-emerald-100 text-xs sm:text-sm truncate">Take a new tongue analysis</p>
            </div>
            <ChevronRight className="ml-auto flex-shrink-0" size={20} />
          </Link>

          <div className="flex-shrink-0 w-[200px] sm:w-auto bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <History size={20} className="text-tcm-green sm:hidden" />
                <History size={24} className="text-tcm-green hidden sm:block" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900">Total Scans</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{scans.length} analyses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Scan History List */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <History size={20} className="text-tcm-green sm:hidden" />
              <History size={24} className="text-tcm-green hidden sm:block" />
              Scan History
            </h2>

            {scans.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan size={28} className="text-gray-400 sm:hidden" />
                  <Scan size={32} className="text-gray-400 hidden sm:block" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No scans yet</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Start your TCM journey by taking your first tongue analysis
                </p>
                <Link
                  href="/"
                  className="inline-block bg-tcm-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-tcm-green-dark active:scale-[0.98] transition-all touch-manipulation"
                >
                  Take First Scan
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {scans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className={`w-full bg-white rounded-xl shadow-sm border p-4 text-left hover:shadow-md active:scale-[0.99] transition-all touch-manipulation ${
                      selectedScan?.id === scan.id ? 'ring-2 ring-tcm-green' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 mb-1 truncate">
                          {scan.primary_pattern}
                        </p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <Calendar size={14} />
                          {formatDate(scan.created_at)}
                        </div>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className={`ml-2 flex-shrink-0 ${selectedScan?.id === scan.id ? 'text-tcm-green' : 'text-gray-400'}`} 
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scan Details - Desktop only */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={24} className="text-tcm-green" />
              Analysis Details
            </h2>

            {selectedScan ? (
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scan Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedScan.created_at)}</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-tcm-green mb-2">Primary Pattern</h3>
                  <p className="text-gray-700">{selectedScan.primary_pattern}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-1 text-sm">Tongue Coat</h4>
                    <p className="text-sm text-gray-600">{selectedScan.coat}</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-lg">
                    <h4 className="font-medium text-rose-800 mb-1 text-sm">Body Color</h4>
                    <p className="text-sm text-gray-600">{selectedScan.color}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1 text-sm">Shape</h4>
                    <p className="text-sm text-gray-600">{selectedScan.shape}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1 text-sm">Moisture</h4>
                    <p className="text-sm text-gray-600">{selectedScan.moisture}</p>
                  </div>
                </div>

                {selectedScan.recommendations && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <p className="text-gray-600 text-sm">{selectedScan.recommendations}</p>
                  </div>
                )}

                {selectedScan.recommended_formula && (
                  <div className="bg-gradient-to-r from-tcm-brown to-amber-700 text-white p-4 rounded-lg">
                    <h4 className="font-medium mb-1">Recommended Formula</h4>
                    <p className="text-amber-100 text-sm">{selectedScan.recommended_formula}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Select a scan</h3>
                <p className="text-gray-600">
                  Click on a scan from your history to view detailed analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
