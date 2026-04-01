import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runWisdomPipeline } from '@/lib/pipeline/wisdom'

export const maxDuration = 300

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { campaignId } = await req.json()
  if (!campaignId) {
    return new Response('Campaign ID required', { status: 400 })
  }

  // Validate campaign exists
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .single()
  if (!campaign) {
    return new Response('Campaign not found', { status: 404 })
  }

  try {
    const result = await runWisdomPipeline({ campaignId })

    if (result.crisisFlag) {
      return NextResponse.json({
        success: true,
        crisisFlag: true,
        message: 'I noticed this topic may touch on emotional crisis. Here are some support resources:',
        helplines: [
          { name: 'iCall', number: '9152987821', country: 'India' },
          { name: 'National Suicide Prevention Lifeline', number: '988', country: 'US' },
          { name: 'Crisis Text Line', text: 'HOME to 741741', country: 'US' },
          { name: 'Samaritans', number: '116 123', country: 'UK' },
        ],
      })
    }

    if (result.timedOut) {
      return NextResponse.json({
        success: true,
        timedOut: true,
        message: 'Wisdom unavailable — continuing with your research context.',
      })
    }

    return NextResponse.json({
      success: true,
      quotes: result.quotes,
    })
  } catch (error) {
    console.error('Wisdom pipeline error:', error)
    return new Response(
      JSON.stringify({ error: 'Wisdom pipeline failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
