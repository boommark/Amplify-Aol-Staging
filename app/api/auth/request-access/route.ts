import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, reason } = body

    // Validate email presence and format
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert access request — route is public (non-allowlisted users are already signed out)
    const { error } = await supabase
      .from('access_requests')
      .insert({
        email: email.trim().toLowerCase(),
        reason: reason?.trim() || null,
        status: 'pending',
      })

    if (error) {
      // Handle duplicate request gracefully
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Request already submitted' },
          { status: 200 }
        )
      }
      console.error('Access request insert error:', error.message)
      return NextResponse.json(
        { error: 'Failed to submit request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Request submitted' }, { status: 201 })
  } catch (error) {
    console.error('Request access error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
