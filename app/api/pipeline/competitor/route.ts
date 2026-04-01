import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runCompetitorScan } from '@/lib/pipeline/competitor'

export const maxDuration = 300

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { region, eventType } = await req.json()
  if (!region || !eventType) {
    return new Response('Region and event type required', { status: 400 })
  }

  try {
    const result = await runCompetitorScan({ region, eventType })
    return NextResponse.json({
      success: true,
      findings: result.findings,
    })
  } catch (error) {
    console.error('Competitor scan error:', error)
    return new Response(
      JSON.stringify({ error: 'Competitor scan failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
