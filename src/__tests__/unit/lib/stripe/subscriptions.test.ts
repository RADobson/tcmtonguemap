import { getOrCreateStripeCustomer, getSubscriptionStatus } from '@/lib/stripe/subscriptions'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
  },
}))

describe('subscriptions', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    upsert: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('getOrCreateStripeCustomer', () => {
    it('returns existing stripe customer id', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { stripe_customer_id: 'cus_existing123' },
        error: null,
      })

      const result = await getOrCreateStripeCustomer('user123', 'user@example.com')

      expect(result).toBe('cus_existing123')
      expect(stripe.customers.create).not.toHaveBeenCalled()
    })

    it('creates new stripe customer when none exists', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const mockCustomer = { id: 'cus_new123' }
      ;(stripe.customers.create as jest.Mock).mockResolvedValue(mockCustomer)
      mockSupabaseClient.upsert.mockResolvedValue({ error: null })

      const result = await getOrCreateStripeCustomer('user123', 'user@example.com')

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        metadata: {
          supabaseUserId: 'user123',
        },
      })
      expect(mockSupabaseClient.upsert).toHaveBeenCalledWith({
        user_id: 'user123',
        stripe_customer_id: 'cus_new123',
        status: 'active',
        tier: 'free',
      })
      expect(result).toBe('cus_new123')
    })

    it('handles stripe customer creation failure', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const stripeError = new Error('Stripe API error')
      ;(stripe.customers.create as jest.Mock).mockRejectedValue(stripeError)

      await expect(getOrCreateStripeCustomer('user123', 'user@example.com')).rejects.toThrow('Stripe API error')
    })

    it('handles database upsert failure', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const mockCustomer = { id: 'cus_new123' }
      ;(stripe.customers.create as jest.Mock).mockResolvedValue(mockCustomer)
      mockSupabaseClient.upsert.mockResolvedValue({ error: new Error('Database error') })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getOrCreateStripeCustomer('user123', 'user@example.com')

      // Should still return the customer ID even if upsert fails
      expect(result).toBe('cus_new123')

      consoleSpy.mockRestore()
    })
  })

  describe('getSubscriptionStatus', () => {
    it('returns free tier when no subscription exists', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      })

      const result = await getSubscriptionStatus('user123')

      expect(result).toEqual({
        tier: 'free',
        status: 'active',
        hasPremium: false,
      })
    })

    it('returns premium status for active premium subscription', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          tier: 'premium',
          status: 'active',
          current_period_end: '2024-12-31T23:59:59Z',
          cancel_at_period_end: false,
        },
        error: null,
      })

      const result = await getSubscriptionStatus('user123')

      expect(result).toEqual({
        tier: 'premium',
        status: 'active',
        hasPremium: true,
        currentPeriodEnd: '2024-12-31T23:59:59Z',
        cancelAtPeriodEnd: false,
      })
    })

    it('returns hasPremium false for inactive premium subscription', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          tier: 'premium',
          status: 'canceled',
          current_period_end: '2024-01-01T00:00:00Z',
          cancel_at_period_end: true,
        },
        error: null,
      })

      const result = await getSubscriptionStatus('user123')

      expect(result).toEqual({
        tier: 'premium',
        status: 'canceled',
        hasPremium: false,
        currentPeriodEnd: '2024-01-01T00:00:00Z',
        cancelAtPeriodEnd: true,
      })
    })

    it('returns hasPremium false for free tier', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          tier: 'free',
          status: 'active',
          current_period_end: null,
          cancel_at_period_end: false,
        },
        error: null,
      })

      const result = await getSubscriptionStatus('user123')

      expect(result.hasPremium).toBe(false)
    })

    it('handles database error gracefully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      })

      const result = await getSubscriptionStatus('user123')

      expect(result).toEqual({
        tier: 'free',
        status: 'active',
        hasPremium: false,
      })
    })
  })
})
