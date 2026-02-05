import { POST as checkoutPOST } from '@/app/api/stripe/checkout/route'
import { POST as portalPOST } from '@/app/api/stripe/portal/route'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'
import { getOrCreateStripeCustomer } from '@/lib/stripe/subscriptions'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  STRIPE_PRICE_IDS: {
    premium: 'price_test123',
  },
  APP_URL: 'http://localhost:3000',
}))
jest.mock('@/lib/stripe/subscriptions')

describe('Stripe API Routes', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('POST /api/stripe/checkout', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId: 'price_test123' }),
      })

      const response = await checkoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Please sign in')
    })

    it('creates checkout session for authenticated user', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockCustomerId = 'cus_test123'
      ;(getOrCreateStripeCustomer as jest.Mock).mockResolvedValue(mockCustomerId)

      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
      }
      ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId: 'price_test123' }),
      })

      const response = await checkoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('cs_test123')
      expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test123')

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: mockCustomerId,
          mode: 'subscription',
          line_items: [{ price: 'price_test123', quantity: 1 }],
        })
      )
    })

    it('handles Stripe API errors', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      ;(getOrCreateStripeCustomer as jest.Mock).mockResolvedValue('cus_test123')
      ;(stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
        new Error('Stripe API error')
      )

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId: 'price_test123' }),
      })

      const response = await checkoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('checkout session')
    })

    it('uses default price ID when not provided', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      ;(getOrCreateStripeCustomer as jest.Mock).mockResolvedValue('cus_test123')
      ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await checkoutPOST(request)

      expect(response.status).toBe(200)
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: 'price_test123', quantity: 1 }],
        })
      )
    })
  })

  describe('POST /api/stripe/portal', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
      })

      const response = await portalPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Please sign in')
    })

    it('creates billing portal session', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { stripe_customer_id: 'cus_test123' },
        error: null,
      })

      const mockPortalSession = {
        url: 'https://billing.stripe.com/session/test123',
      }
      ;(stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession)

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
      })

      const response = await portalPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.url).toBe('https://billing.stripe.com/session/test123')

      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test123',
        return_url: expect.stringContaining('/dashboard'),
      })
    })

    it('returns 400 when no subscription found', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
      })

      const response = await portalPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No subscription found')
    })

    it('handles Stripe billing portal errors', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { stripe_customer_id: 'cus_test123' },
        error: null,
      })

      ;(stripe.billingPortal.sessions.create as jest.Mock).mockRejectedValue(
        new Error('Portal error')
      )

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
      })

      const response = await portalPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('portal session')
    })
  })
})
