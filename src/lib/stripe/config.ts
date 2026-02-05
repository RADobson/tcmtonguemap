import Stripe from 'stripe'

// Initialize Stripe lazily to allow builds without the key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

export const stripe = new Stripe(stripeSecretKey, {
  // @ts-expect-error - Using latest Stripe API version
  apiVersion: '2024-12-18.acacia',
})

// Helper to ensure Stripe is configured before use
export function ensureStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
}

// Stripe Price IDs - Update these with your actual Stripe price IDs
export const STRIPE_PRICE_IDS = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
}

// App URL for redirects
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
