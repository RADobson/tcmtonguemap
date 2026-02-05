'use client'

/**
 * Analytics Dashboard Component
 * 
 * Displays conversion funnels and key metrics for the TCM Tongue App.
 * This is a client-side visualization of analytics data.
 */

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Scan,
  CreditCard,
  MousePointer,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react'

// Mock data generators for demonstration
// In production, these would come from your analytics API

const generateDateRange = (days: number): string[] => {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  }
  return dates
}

const generateMockTimeSeries = (days: number, baseValue: number, variance: number) => {
  return generateDateRange(days).map(date => ({
    date,
    value: Math.floor(baseValue + Math.random() * variance - variance / 2),
  }))
}

// Mock funnel data
const mockFunnelData = [
  { name: 'Page Views', value: 10000, fill: '#2d5a27' },
  { name: 'Scan Uploads', value: 3500, fill: '#3d7a37' },
  { name: 'Analysis Complete', value: 3200, fill: '#4d9a47' },
  { name: 'Signups Started', value: 1200, fill: '#6db767' },
  { name: 'Signups Complete', value: 800, fill: '#8dd787' },
  { name: 'Premium Upgrades', value: 120, fill: '#10b981' },
]

// Mock conversion data
const mockConversionData = [
  { date: 'Mon', scans: 45, signups: 12, upgrades: 2 },
  { date: 'Tue', scans: 52, signups: 15, upgrades: 3 },
  { date: 'Wed', scans: 48, signups: 10, upgrades: 1 },
  { date: 'Thu', scans: 61, signups: 18, upgrades: 4 },
  { date: 'Fri', scans: 55, signups: 14, upgrades: 3 },
  { date: 'Sat', scans: 72, signups: 22, upgrades: 5 },
  { date: 'Sun', scans: 68, signups: 20, upgrades: 4 },
]

// Mock traffic sources
const mockTrafficSources = [
  { name: 'Organic Search', value: 45, color: '#2d5a27' },
  { name: 'Direct', value: 25, color: '#3d7a37' },
  { name: 'Social Media', value: 18, color: '#4d9a47' },
  { name: 'Referral', value: 8, color: '#6db767' },
  { name: 'Email', value: 4, color: '#8dd787' },
]

// Mock device breakdown
const mockDeviceData = [
  { name: 'Mobile', value: 68, color: '#2d5a27' },
  { name: 'Desktop', value: 28, color: '#4d9a47' },
  { name: 'Tablet', value: 4, color: '#8dd787' },
]

// Mock affiliate performance
const mockAffiliateData = [
  { name: 'Herbal Formulas', clicks: 450, conversions: 23, revenue: 1150 },
  { name: 'TCM Books', clicks: 320, conversions: 18, revenue: 540 },
  { name: 'Supplements', clicks: 280, conversions: 12, revenue: 720 },
  { name: 'Tools', clicks: 150, conversions: 5, revenue: 250 },
]

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  subtitle?: string
}

function MetricCard({ title, value, change, icon, subtitle }: MetricCardProps) {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4">
        {isPositive ? (
          <ArrowUpRight size={16} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={16} className="text-red-600" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-400">vs last week</span>
      </div>
    </div>
  )
}

interface FunnelStageProps {
  name: string
  value: number
  total: number
  previousValue?: number
}

function FunnelStage({ name, value, total, previousValue }: FunnelStageProps) {
  const percentage = Math.round((value / total) * 100)
  const conversionRate = previousValue ? Math.round((value / previousValue) * 100) : 100
  
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-32 text-sm font-medium text-gray-700">{name}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-tcm-green rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 w-16">{value.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-24 text-right">
        <span className="text-sm font-medium text-gray-600">{percentage}%</span>
        {previousValue && (
          <span className="text-xs text-gray-400 block">{conversionRate}% conv.</span>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'affiliates'>('overview')

  // Calculate metrics
  const metrics = useMemo(() => ({
    totalScans: '1,247',
    totalUsers: '856',
    conversionRate: '15.2%',
    affiliateRevenue: '$2,660',
    scanChange: 12.5,
    userChange: 8.3,
    conversionChange: 2.1,
    revenueChange: -5.2,
  }), [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tcm-green rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">TCM Tongue Map Performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-tcm-green"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              
              {/* Export Button */}
              <button className="flex items-center gap-2 bg-tcm-green text-white px-4 py-2 rounded-lg font-medium hover:bg-tcm-green-dark transition-colors">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-4">
            {(['overview', 'funnel', 'affiliates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-tcm-green text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Total Scans"
                value={metrics.totalScans}
                change={metrics.scanChange}
                icon={<Scan className="text-tcm-green" size={24} />}
                subtitle="This week"
              />
              <MetricCard
                title="Active Users"
                value={metrics.totalUsers}
                change={metrics.userChange}
                icon={<Users className="text-tcm-green" size={24} />}
                subtitle="Unique visitors"
              />
              <MetricCard
                title="Conversion Rate"
                value={metrics.conversionRate}
                change={metrics.conversionChange}
                icon={<Target className="text-tcm-green" size={24} />}
                subtitle="Free to Premium"
              />
              <MetricCard
                title="Affiliate Revenue"
                value={metrics.affiliateRevenue}
                change={metrics.revenueChange}
                icon={<CreditCard className="text-tcm-green" size={24} />}
                subtitle="Estimated"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Conversion Trends */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockConversionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      name="Scans"
                      stackId="1"
                      stroke="#2d5a27"
                      fill="#2d5a27"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="signups"
                      name="Signups"
                      stackId="1"
                      stroke="#4d9a47"
                      fill="#4d9a47"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="upgrades"
                      name="Upgrades"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockTrafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {mockTrafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Device Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockDeviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" name="Usage %" radius={[0, 4, 4, 0]}>
                      {mockDeviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Key Events */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Performance</h3>
                <div className="space-y-4">
                  {[
                    { event: 'scan_upload', count: 1247, avgTime: '2.3s', trend: '+12%' },
                    { event: 'analysis_complete', count: 1189, avgTime: '8.5s', trend: '+8%' },
                    { event: 'sign_up', count: 203, avgTime: '-', trend: '+15%' },
                    { event: 'purchase', count: 31, avgTime: '-', trend: '+22%' },
                    { event: 'affiliate_click', count: 892, avgTime: '-', trend: '-5%' },
                  ].map((item) => (
                    <div key={item.event} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-tcm-green" />
                        <span className="font-medium text-gray-700">{item.event.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-900 font-semibold">{item.count.toLocaleString()}</span>
                        <span className="text-gray-500 w-16">{item.avgTime}</span>
                        <span className={`w-16 text-right ${item.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'funnel' && (
          <div className="space-y-6">
            {/* Main Conversion Funnel */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Filter size={16} />
                  <span>All Users</span>
                </div>
              </div>
              
              <div className="max-w-3xl">
                {mockFunnelData.map((stage, index) => (
                  <FunnelStage
                    key={stage.name}
                    name={stage.name}
                    value={stage.value}
                    total={mockFunnelData[0].value}
                    previousValue={index > 0 ? mockFunnelData[index - 1].value : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Funnel Metrics */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Scan to Signup</h4>
                <div className="text-3xl font-bold text-tcm-green mb-2">22.9%</div>
                <p className="text-sm text-gray-500">800 signups from 3,500 scans</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-tcm-green rounded-full" style={{ width: '22.9%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Signup to Premium</h4>
                <div className="text-3xl font-bold text-tcm-green mb-2">15.0%</div>
                <p className="text-sm text-gray-500">120 upgrades from 800 signups</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-tcm-green rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Overall Conversion</h4>
                <div className="text-3xl font-bold text-tcm-green mb-2">3.4%</div>
                <p className="text-sm text-gray-500">120 upgrades from 3,500 scans</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-tcm-green rounded-full" style={{ width: '3.4%' }} />
                </div>
              </div>
            </div>

            {/* Drop-off Analysis */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Drop-off Analysis</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { stage: 'Upload → Analysis', dropoff: 8.6 },
                  { stage: 'Analysis → Signup', dropoff: 62.5 },
                  { stage: 'Signup Start → Complete', dropoff: 33.3 },
                  { stage: 'User → Premium', dropoff: 85.0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                  <Tooltip />
                  <Bar dataKey="dropoff" name="Drop-off Rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="space-y-6">
            {/* Affiliate Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Affiliate Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conv. Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockAffiliateData.map((item) => (
                      <tr key={item.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{item.clicks}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{item.conversions}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {((item.conversions / item.clicks) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ${item.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-900">Total</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {mockAffiliateData.reduce((a, b) => a + b.clicks, 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {mockAffiliateData.reduce((a, b) => a + b.conversions, 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        {((mockAffiliateData.reduce((a, b) => a + b.conversions, 0) / 
                           mockAffiliateData.reduce((a, b) => a + b.clicks, 0)) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        ${mockAffiliateData.reduce((a, b) => a + b.revenue, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Liu Wei Di Huang Wan', clicks: 145, revenue: 580 },
                    { name: 'The Foundations of TCM', clicks: 98, revenue: 294 },
                    { name: 'Si Jun Zi Tang', clicks: 87, revenue: 348 },
                    { name: 'Reishi Mushroom Extract', clicks: 76, revenue: 380 },
                    { name: 'Acupressure Mat', clicks: 54, revenue: 108 },
                  ].map((product, index) => (
                    <div key={product.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 flex items-center justify-center bg-tcm-green text-white rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.clicks} clicks</p>
                      </div>
                      <span className="font-semibold text-gray-900">${product.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Trends</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockConversionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="scans"
                      name="Affiliate Clicks"
                      stroke="#2d5a27"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}