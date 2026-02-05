'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Check, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Crown,
  Zap,
  Shield
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  icon: React.ReactNode
  features: PricingFeature[]
  cta: string
  popular?: boolean
  tier: 'free' | 'premium'
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out tongue diagnosis',
    icon: <Shield className="w-6 h-6" />,
    tier: 'free',
    features: [
      { text: '1 tongue scan per day', included: true },
      { text: 'Basic pattern analysis', included: true },
      { text: 'General recommendations', included: true },
      { text: 'Save scan history', included: true },
      { text: 'Unlimited scans', included: false },
      { text: 'Detailed PDF reports', included: false },
      { text: 'Advanced pattern insights', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'Unlock the full power of AI diagnosis',
    icon: <Crown className="w-6 h-6" />,
    tier: 'premium',
    popular: true,
    features: [
      { text: 'Unlimited tongue scans', included: true },
      { text: 'Advanced pattern analysis', included: true },
      { text: 'Detailed wellness recommendations', included: true },
      { text: 'Save unlimited scan history', included: true },
      { text: 'Detailed PDF reports', included: true },
      { text: 'Advanced pattern insights', included: true },
      { text: 'Herbal formula suggestions', included: true },
      { text: 'Priority email support', included: true },
    ],
    cta: 'Upgrade to Premium',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user)
          // Get subscription status
          fetch('/api/subscription/status')
            .then(res => res.ok ? res.json() : null)
            .then(sub => setSubscription(sub))
        }
      })
      .catch(console.error)
  }, [])

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!user) {
        // Redirect to signup if not logged in
        router.push('/signup?redirect=/pricing')
        return
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  const isPremium = subscription?.tier === 'premium' && subscription?.status === 'active'

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you're ready to unlock the full power of AI-powered TCM diagnosis.
          </p>
        </div>

        {/* Canceled Message */}
        {canceled && (
          <div className="max-w-md mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-amber-800 text-sm">
              Checkout was canceled. You can try again whenever you're ready.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 sm:p-8 transition-all ${
                tier.popular
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xl scale-105'
                  : 'bg-white border-2 border-gray-100 hover:border-emerald-200 hover:shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Zap size={14} />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  tier.popular ? 'bg-white/20' : 'bg-emerald-100'
                }`}>
                  <span className={tier.popular ? 'text-white' : 'text-emerald-600'}>
                    {tier.icon}
                  </span>
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h2>
                <p className={`text-sm ${tier.popular ? 'text-emerald-100' : 'text-gray-600'}`}>
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
                  {tier.price}
                </span>
                <span className={tier.popular ? 'text-emerald-200' : 'text-gray-500'}>
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`flex-shrink-0 mt-0.5 ${
                        tier.popular ? 'text-emerald-300' : 'text-emerald-600'
                      }`} size={18} />
                    ) : (
                      <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 border-gray-300 mt-0.5" />
                    )}
                    <span className={`text-sm ${
                      feature.included
                        ? tier.popular ? 'text-white' : 'text-gray-700'
                        : tier.popular ? 'text-emerald-200/60' : 'text-gray-400'
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isPremium && tier.tier === 'premium' ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all active:scale-[0.98] touch-manipulation ${
                    tier.popular
                      ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Loading...
                    </span>
                  ) : (
                    'Manage Subscription'
                  )}
                </button>
              ) : !isPremium && tier.tier === 'free' ? (
                <Link
                  href="/"
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all active:scale-[0.98] touch-manipulation ${
                    tier.popular
                      ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Current Plan
                </Link>
              ) : (
                <button
                  onClick={tier.tier === 'premium' ? handleCheckout : undefined}
                  disabled={isLoading || tier.tier === 'free'}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all active:scale-[0.98] touch-manipulation ${
                    tier.popular
                      ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                      : tier.tier === 'free'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  } disabled:opacity-50`}
                >
                  {isLoading && tier.tier === 'premium' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Loading...
                    </span>
                  ) : (
                    tier.cta
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ / Trust Section */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-600" size={16} />
              <span>Secure payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-emerald-600" size={16} />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-600" size={16} />
              <span>7-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
