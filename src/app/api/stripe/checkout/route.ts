import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS, APP_URL } from '@/lib/stripe/config'
import { getOrCreateStripeCustomer } from '@/lib/stripe/subscriptions'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(user.id, user.email!)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: STRIPE_PRICE_IDS.premium,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: {
        supabaseUserId: user.id,
      },
      subscription_data: {
        metadata: {
          supabaseUserId: user.id,
        },
      },
      success_url: `${APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
