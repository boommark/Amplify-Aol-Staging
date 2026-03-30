import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockAuthUser, mockCampaign } from '../helpers/supabase-mock'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/ai/orchestrator', () => ({
  runStreamingTask: vi.fn(),
}))

describe('Chat Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persists assistant message with parts jsonb', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    const campaign = mockCampaign()
    const mockClient = createMockSupabaseClient()

    mockClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockAuthUser() },
      error: null,
    })

    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const singleMock = vi.fn().mockResolvedValue({ data: campaign, error: null })
    const eqCampaignMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectCampaignMock = vi.fn().mockReturnValue({ eq: eqCampaignMock })
    const updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

    mockClient.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return { select: selectCampaignMock, update: updateMock }
      }
      return { insert: insertMock }
    })

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    // Capture the onFinish callback so we can invoke it manually
    let capturedOnFinish: ((result: { text: string }) => Promise<void>) | undefined

    vi.mocked(runStreamingTask).mockImplementation(async (_key, options) => {
      capturedOnFinish = options.onFinish
      return {
        toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('ok', { status: 200 })),
      } as any
    })

    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello', parts: [{ type: 'text', text: 'Hello' }] }],
        campaignId: campaign.id,
      }),
    })

    await POST(req)

    // Simulate stream finishing with assistant text
    await capturedOnFinish?.({ text: 'AI response text' })

    // Verify the assistant message was inserted with parts array
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'assistant',
        parts: [{ type: 'text', text: 'AI response text' }],
      }),
    )
  }) // CHAT-08

  it('persists user message idempotently', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    const campaign = mockCampaign()
    const mockClient = createMockSupabaseClient()

    mockClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockAuthUser() },
      error: null,
    })

    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const singleMock = vi.fn().mockResolvedValue({ data: campaign, error: null })
    const eqCampaignMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectCampaignMock = vi.fn().mockReturnValue({ eq: eqCampaignMock })
    const updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

    mockClient.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return { select: selectCampaignMock, update: updateMock }
      }
      return { insert: insertMock }
    })

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    vi.mocked(runStreamingTask).mockResolvedValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('ok', { status: 200 })),
    } as any)

    const { POST } = await import('@/app/api/chat/route')
    const userMessage = 'I want to promote a yoga workshop'
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: userMessage, parts: [{ type: 'text', text: userMessage }] },
        ],
        campaignId: campaign.id,
      }),
    })

    await POST(req)

    // The user message should be inserted exactly once before streaming starts
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: userMessage,
        campaign_id: campaign.id,
      }),
    )

    // Insert is called once for user message (assistant message persisted in onFinish, not here)
    const userInsertCalls = insertMock.mock.calls.filter(
      (call) => call[0]?.role === 'user',
    )
    expect(userInsertCalls).toHaveLength(1)
  }) // CHAT-08
})
