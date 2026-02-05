'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, 
  LogOut, 
  User, 
  History, 
  Calendar, 
  ChevronRight,
  Scan,
  Home
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [scans, setScans] = useState<TongueScan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScan, setSelectedScan] = useState<TongueScan | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndScans = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: scansData, error } = await supabase
        .from('tongue_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching scans:', error)
      } else {
        setScans(scansData || [])
      }

      setLoading(false)
    }

    fetchUserAndScans()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-tcm-green" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-tcm-green">
                TCM Tongue Map
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Track your tongue health journey and view your scan history
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/"
            className="bg-tcm-green text-white p-6 rounded-xl hover:bg-emerald-800 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Scan size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">New Scan</h3>
              <p className="text-emerald-100 text-sm">Take a new tongue analysis</p>
            </div>
            <ChevronRight className="ml-auto" size={24} />
          </Link>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <History size={24} className="text-tcm-green" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Total Scans</h3>
                <p className="text-gray-600 text-sm">{scans.length} analyses completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scan History List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History size={24} className="text-tcm-green" />
              Scan History
            </h2>

            {scans.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan size={32} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No scans yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your TCM journey by taking your first tongue analysis
                </p>
                <Link
                  href="/"
                  className="inline-block bg-tcm-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition"
                >
                  Take First Scan
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {scans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className={`w-full bg-white rounded-xl shadow-sm border p-4 text-left hover:shadow-md transition ${
                      selectedScan?.id === scan.id ? 'ring-2 ring-tcm-green' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {scan.primary_pattern}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          {formatDate(scan.created_at)}
                        </div>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className={`text-gray-400 ${selectedScan?.id === scan.id ? 'text-tcm-green' : ''}`} 
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scan Details */}
          <div>
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
    </div>
  )
}
