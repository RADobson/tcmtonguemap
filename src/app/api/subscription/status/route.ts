import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        tier: 'free',
        status: 'active',
        hasPremium: false,
      })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({
        tier: 'free',
        status: 'active',
        hasPremium: false,
      })
    }

    return NextResponse.json({
      tier: data.tier,
      status: data.status,
      hasPremium: data.tier === 'premium' && data.status === 'active',
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json({
      tier: 'free',
      status: 'active',
      hasPremium: false,
    })
  }
}
