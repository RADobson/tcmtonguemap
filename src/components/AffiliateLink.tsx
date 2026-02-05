'use client'

/**
 * Affiliate Link Component
 * 
 * Wraps external links with analytics tracking for affiliate revenue monitoring.
 */

import { useCallback, ReactNode } from 'react'
import { trackAffiliateLinkClick } from '@/lib/analytics'

interface AffiliateLinkProps {
  href: string
  productId: string
  productName: string
  category: 'herbal_formula' | 'supplement' | 'book' | 'tool' | 'service'
  retailer: string
  estimatedValue?: number
  children: ReactNode
  className?: string
  openInNewTab?: boolean
}

export default function AffiliateLink({
  href,
  productId,
  productName,
  category,
  retailer,
  estimatedValue,
  children,
  className,
  openInNewTab = true,
}: AffiliateLinkProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track the affiliate link click
    trackAffiliateLinkClick({
      product_id: productId,
      product_name: productName,
      product_category: category,
      retailer,
      estimated_value: estimatedValue,
    })
  }, [productId, productName, category, retailer, estimatedValue])

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer sponsored' : 'sponsored'}
    >
      {children}
    </a>
  )
}

/**
 * Hook for tracking affiliate clicks programmatically
 */
export function useAffiliateTracking() {
  const trackClick = useCallback((params: {
    productId: string
    productName: string
    category: 'herbal_formula' | 'supplement' | 'book' | 'tool' | 'service'
    retailer: string
    estimatedValue?: number
  }) => {
    trackAffiliateLinkClick({
      product_id: params.productId,
      product_name: params.productName,
      product_category: params.category,
      retailer: params.retailer,
      estimated_value: params.estimatedValue,
    })
  }, [])

  return { trackClick }
}