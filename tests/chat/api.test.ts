import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockAuthUser, mockCampaign } from '../helpers/supabase-mock'

// Mock the supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock the orchestrator
vi.mock('@/lib/ai/orchestrator', () => ({
  runStreamingTask: vi.fn(),
}))

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for unauthenticated request', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockClient = createMockSupabaseClient()
    // getUser returns null user
    mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }], campaignId: 'abc' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(401)
  }) // INFRA-07

  it('returns 400 when messages are missing', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockClient = createMockSupabaseClient()
    mockClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockAuthUser() },
      error: null,
    })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: 'abc' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when campaignId is missing', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockClient = createMockSupabaseClient()
    mockClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockAuthUser() },
      error: null,
    })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns streaming response for authenticated user', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    const campaign = mockCampaign()
    const mockClient = createMockSupabaseClient()
    mockClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockAuthUser() },
      error: null,
    })

    // Chain mock for campaigns.select('id').eq('id', ...).single()
    const singleMock = vi.fn().mockResolvedValue({ data: campaign, error: null })
    const eqMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectCampaignMock = vi.fn().mockReturnValue({ eq: eqMock })

    // Chain mock for campaign_messages.insert / campaigns.update
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

    mockClient.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return {
          select: selectCampaignMock,
          update: updateMock,
        }
      }
      // campaign_messages
      return { insert: insertMock }
    })

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    // Mock streaming result
    const mockStreamResult = {
      toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('stream', { status: 200 })),
    }
    vi.mocked(runStreamingTask).mockResolvedValue(mockStreamResult as any)

    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello', parts: [{ type: 'text', text: 'hello' }] }],
        campaignId: campaign.id,
        tone: 'inspiring',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    expect(runStreamingTask).toHaveBeenCalledWith('chat.orchestrate', expect.objectContaining({
      variables: { tone: 'inspiring' },
    }))
  }) // CHAT-02

  it('accepts tone parameter in request body', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    const campaign = mockCampaign()
    const mockClient = createMockSupabaseClient()
    mockClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockAuthUser() },
      error: null,
    })

    const singleMock = vi.fn().mockResolvedValue({ data: campaign, error: null })
    const eqMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectCampaignMock = vi.fn().mockReturnValue({ eq: eqMock })
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

    mockClient.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return { select: selectCampaignMock, update: updateMock }
      }
      return { insert: insertMock }
    })

    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const mockStreamResult = {
      toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('stream', { status: 200 })),
    }
    vi.mocked(runStreamingTask).mockResolvedValue(mockStreamResult as any)

    const { POST } = await import('@/app/api/chat/route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hi', parts: [{ type: 'text', text: 'hi' }] }],
        campaignId: campaign.id,
        tone: 'formal',
      }),
    })

    await POST(req)
    expect(runStreamingTask).toHaveBeenCalledWith('chat.orchestrate', expect.objectContaining({
      variables: { tone: 'formal' },
    }))
  }) // CHAT-07
})
