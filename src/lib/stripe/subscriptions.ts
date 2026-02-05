import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'

export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const supabase = createClient()
  
  // Check if user already has a Stripe customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabaseUserId: userId,
    },
  })

  // Store the customer ID in the database
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customer.id,
      status: 'active',
      tier: 'free',
    })

  return customer.id
}

export async function getSubscriptionStatus(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return {
      tier: 'free',
      status: 'active',
      hasPremium: false,
    }
  }

  return {
    tier: data.tier,
    status: data.status,
    hasPremium: data.tier === 'premium' && data.status === 'active',
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
  }
}
