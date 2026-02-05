import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { trackSubscriptionEvent } from '@/lib/analytics-server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Helper type for subscription data with period fields
interface SubscriptionData {
  id: string
  status: string
  metadata?: { supabaseUserId?: string }
  items: { data: Array<{ price: { id: string } }> }
  cancel_at_period_end: boolean
  current_period_start?: number
  current_period_end?: number
}

// Invoice type with subscription
interface InvoiceData {
  subscription?: string | null
  customer?: string
  amount_paid?: number
  currency?: string
}

function getSubscriptionDates(subscription: SubscriptionData) {
  const now = new Date()
  const periodStart = subscription.current_period_start 
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : now.toISOString()
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  return { periodStart, periodEnd }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get subscription details
        if (session.subscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as unknown as SubscriptionData
          
          // Get user ID from subscription metadata or session
          const userId = subscriptionData.metadata?.supabaseUserId || session.metadata?.supabaseUserId
          
          if (userId) {
            const { periodStart, periodEnd } = getSubscriptionDates(subscriptionData)
            
            // Update subscription in database
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionData.id,
                stripe_price_id: subscriptionData.items.data[0]?.price.id,
                status: subscriptionData.status,
                tier: 'premium',
                current_period_start: periodStart,
                current_period_end: periodEnd,
                cancel_at_period_end: subscriptionData.cancel_at_period_end,
              }, {
                onConflict: 'user_id',
              })
            
            // Track subscription created event
            await trackSubscriptionEvent('created', {
              userId,
              subscriptionId: subscriptionData.id,
              tier: 'premium',
              value: (session.amount_total || 0) / 100,
              currency: session.currency || 'usd',
            })
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as InvoiceData
        
        if (invoice.subscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          ) as unknown as SubscriptionData
          
          // Get user ID from subscription metadata
          const userId = subscriptionData.metadata?.supabaseUserId
          
          if (userId) {
            const { periodStart, periodEnd } = getSubscriptionDates(subscriptionData)
            
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: invoice.customer as string,
                stripe_subscription_id: subscriptionData.id,
                stripe_price_id: subscriptionData.items.data[0]?.price.id,
                status: subscriptionData.status,
                tier: 'premium',
                current_period_start: periodStart,
                current_period_end: periodEnd,
                cancel_at_period_end: subscriptionData.cancel_at_period_end,
              }, {
                onConflict: 'user_id',
              })
            
            // Track payment succeeded event
            await trackSubscriptionEvent('payment_succeeded', {
              userId,
              subscriptionId: subscriptionData.id,
              tier: 'premium',
              value: (invoice.amount_paid || 0) / 100,
              currency: invoice.currency || 'usd',
            })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as SubscriptionData
        
        const userId = subscription.metadata?.supabaseUserId
        
        if (userId) {
          const { periodStart, periodEnd } = getSubscriptionDates(subscription)
          
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
              tier: subscription.status === 'active' ? 'premium' : 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as SubscriptionData
        const userId = subscription.metadata?.supabaseUserId
        
        // Downgrade to free tier when subscription is canceled
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            tier: 'free',
            stripe_subscription_id: null,
            stripe_price_id: null,
            current_period_end: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        
        // Track subscription cancelled event
        if (userId) {
          await trackSubscriptionEvent('cancelled', {
            userId,
            subscriptionId: subscription.id,
            tier: 'free',
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as InvoiceData
        
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}