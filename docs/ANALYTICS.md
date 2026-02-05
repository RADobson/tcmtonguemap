# TCM Tongue Map - Analytics & Tracking Setup

## Overview

This document describes the Google Analytics 4 (GA4) integration for the TCM Tongue Map application, including event tracking for key user actions and a dashboard for monitoring conversion funnels.

## Files Created

### Core Analytics Files

| File | Description |
|------|-------------|
| `src/lib/analytics.ts` | Client-side GA4 event tracking library |
| `src/lib/analytics-server.ts` | Server-side GA4 Measurement Protocol for API routes |
| `src/hooks/useAnalytics.ts` | React hook for analytics tracking in components |
| `src/components/GA4Provider.tsx` | Provider component for GA4 initialization |
| `src/components/AnalyticsDashboard.tsx` | Analytics dashboard with conversion funnels |
| `src/components/AffiliateLink.tsx` | Component for tracking affiliate link clicks |
| `src/app/analytics/page.tsx` | Analytics dashboard page route |

## Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Google Analytics 4 Configuration
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX  # Your GA4 measurement ID
GA4_API_SECRET=your_ga4_api_secret           # For server-side Measurement Protocol
```

### Getting GA4 Credentials

1. **Measurement ID**: Go to GA4 Admin → Data Streams → Your Web Stream → Copy Measurement ID
2. **API Secret**: GA4 Admin → Data Streams → Your Web Stream → Measurement Protocol API secrets → Create

## Events Tracked

### Scan Events
- `scan_upload_start` - User starts uploading an image
- `scan_upload_complete` - Image upload finished successfully
- `scan_upload_error` - Upload failed (with error details)

### Analysis Events
- `analysis_start` - AI analysis begins
- `analysis_complete` - Analysis finished (with pattern details, confidence score)
- `analysis_error` - Analysis failed (with error type)

### User Lifecycle
- `sign_up` - User creates an account
- `login` - User logs in

### Premium/Subscription Events
- `begin_checkout` - User starts upgrade flow
- `purchase` - Successful premium subscription
- `subscription_cancelled` - User cancels subscription
- `scan_limit_reached` - Free user hits daily limit

### Affiliate Events
- `affiliate_link_click` - User clicks affiliate product link
- `affiliate_product_view` - User views affiliate product details

## Usage Examples

### Client-Side Tracking

```tsx
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleScan = () => {
    analytics.trackScanStart('camera')
    // ... scan logic
    analytics.trackScanSuccess('camera', durationMs, fileSize)
  }
  
  return <button onClick={handleScan}>Scan</button>
}
```

### Server-Side Tracking (API Routes)

```ts
import { trackSubscriptionEvent } from '@/lib/analytics-server'

// In your API route
await trackSubscriptionEvent('payment_succeeded', {
  userId: 'user-123',
  subscriptionId: 'sub-456',
  tier: 'premium',
  value: 9.99,
  currency: 'usd',
})
```

### Affiliate Link Tracking

```tsx
import AffiliateLink from '@/components/AffiliateLink'

<AffiliateLink
  href="https://amazon.com/product/123"
  productId="liu-wei-di-huang-wan"
  productName="Liu Wei Di Huang Wan"
  category="herbal_formula"
  retailer="amazon"
  estimatedValue={25.99}
>
  Buy Now
</AffiliateLink>
```

## Analytics Dashboard

Access the dashboard at `/analytics` to view:

1. **Overview Tab**
   - Total scans, active users, conversion rate, affiliate revenue
   - Daily activity charts
   - Traffic source breakdown
   - Device usage statistics
   - Event performance metrics

2. **Funnel Tab**
   - Visual conversion funnel (Page View → Scan → Analysis → Signup → Premium)
   - Drop-off analysis between stages
   - Key conversion rate metrics

3. **Affiliates Tab**
   - Product category performance
   - Click-through and conversion rates
   - Revenue by product
   - Trend charts

## Conversion Funnel Stages

```
Page Views (100%)
    ↓
Scan Uploads (35%)
    ↓
Analysis Complete (32%)
    ↓
Signups Started (12%)
    ↓
Signups Complete (8%)
    ↓
Premium Upgrades (1.2%)
```

## GA4 Custom Dimensions

Configure these custom dimensions in GA4 Admin:

| Dimension | Scope | Parameter |
|-----------|-------|-----------|
| Subscription Tier | User | subscription_tier |
| Scans Completed | User | scans_completed |
| User Type | User | user_type |

## Debugging

In development mode, all analytics events are logged to the console:
```
[GA4 Debug] analysis_complete { primary_pattern: "Spleen Qi Deficiency", ... }
```

For production debugging, use GA4 DebugView:
1. Install Google Analytics Debugger Chrome extension
2. Enable DebugView in GA4 Admin
3. View real-time events with full parameters

## Best Practices

1. **Privacy**: Analytics only tracks anonymized usage patterns, no PII
2. **Consent**: Implement cookie consent banner for GDPR compliance
3. **Performance**: GA4 script loads asynchronously, doesn't block rendering
4. **Error Handling**: Failed tracking calls don't break app functionality

## Testing Checklist

- [ ] Page views tracked on navigation
- [ ] Scan upload events fire correctly
- [ ] Analysis complete includes pattern data
- [ ] Signup tracking works
- [ ] Premium purchase events from Stripe webhooks
- [ ] Affiliate link clicks tracked
- [ ] Dashboard displays mock data correctly
- [ ] Server-side events reach GA4
