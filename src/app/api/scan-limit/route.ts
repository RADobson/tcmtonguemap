import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // For anonymous users, allow limited scans
      return NextResponse.json({
        canScan: true,
        tier: 'anonymous',
        scansToday: 0,
        scansRemaining: 1,
        message: 'Anonymous user - limited scan available',
      })
    }

    // Check scan availability using the database function
    const { data, error } = await supabase
      .rpc('can_user_scan', { p_user_id: user.id })

    if (error) {
      console.error('Error checking scan availability:', error)
      return NextResponse.json(
        { error: 'Failed to check scan availability' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Scan check error:', error)
    return NextResponse.json(
      { error: 'Failed to check scan availability' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to save scans' },
        { status: 401 }
      )
    }

    // Record the scan using the database function
    const { data, error } = await supabase
      .rpc('record_scan', { p_user_id: user.id })

    if (error) {
      console.error('Error recording scan:', error)
      return NextResponse.json(
        { error: 'Failed to record scan' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Scan record error:', error)
    return NextResponse.json(
      { error: 'Failed to record scan' },
      { status: 500 }
    )
  }
}
