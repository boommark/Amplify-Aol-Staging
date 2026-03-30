import { createClient } from '@/lib/supabase/server'
import { runStreamingTask } from '@/lib/ai/orchestrator'

export const maxDuration = 300

export async function POST(req: Request) {
  // AUTH FIRST — before any AI SDK usage
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, campaignId, tone = 'inspiring' } = await req.json()

  // Validate required fields
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response('Messages required', { status: 400 })
  }
  if (!campaignId) {
    return new Response('Campaign ID required', { status: 400 })
  }

  // Validate campaign exists BEFORE any message persistence
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .single()
  if (!campaign) {
    return new Response('Campaign not found', { status: 404 })
  }

  // Persist user message (the latest one) after campaign validation
  const lastUserMsg = messages[messages.length - 1]
  if (lastUserMsg?.role === 'user') {
    await supabase.from('campaign_messages').insert({
      campaign_id: campaignId,
      role: 'user',
      content: lastUserMsg.content,
      parts: [{ type: 'text', text: lastUserMsg.content }],
    })
  }

  // Update campaign updated_at to support sidebar recency sorting
  await supabase
    .from('campaigns')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', campaignId)

  // Delegate ALL AI logic to the orchestrator — model lookup, prompt loading,
  // rendering, and sliding window are handled inside runStreamingTask.
  const result = await runStreamingTask('chat.orchestrate', {
    messages,
    variables: { tone },
    onFinish: async ({ text }) => {
      // Persist assistant message ONLY after stream completes (not mid-stream)
      await supabase.from('campaign_messages').insert({
        campaign_id: campaignId,
        role: 'assistant',
        content: text,
        parts: [{ type: 'text', text }],
        model: 'claude-sonnet-4-5',
      })
    },
  })

  return result.toUIMessageStreamResponse()
}
