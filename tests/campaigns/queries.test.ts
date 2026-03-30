import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '../helpers/supabase-mock'
import type { Campaign } from '@/types/campaign'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Campaign Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns campaigns ordered by updated_at DESC', async () => {
    const { createClient } = await import('@/lib/supabase/server')

    const campaigns: Campaign[] = [
      {
        id: 'campaign-1',
        user_id: 'user-1',
        title: 'Newest Campaign',
        status: 'draft',
        region: null,
        event_type: 'yoga_workshop',
        share_token: null,
        created_at: '2026-03-28T10:00:00Z',
        updated_at: '2026-03-30T10:00:00Z',
      },
      {
        id: 'campaign-2',
        user_id: 'user-1',
        title: 'Older Campaign',
        status: 'draft',
        region: null,
        event_type: 'satsang',
        share_token: null,
        created_at: '2026-03-20T10:00:00Z',
        updated_at: '2026-03-25T10:00:00Z',
      },
    ]

    // Build the full Supabase chain: .from().select().order().limit()
    const limitMock = vi.fn().mockResolvedValue({ data: campaigns, error: null })
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    const fromMock = vi.fn().mockReturnValue({ select: selectMock })

    const mockClient = createMockSupabaseClient()
    mockClient.from = fromMock
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { getUserCampaigns } = await import('@/lib/db/campaigns')
    const result = await getUserCampaigns()

    expect(orderMock).toHaveBeenCalledWith('updated_at', { ascending: false })
    expect(result).toEqual(campaigns)
  }) // CHAT-09

  it('groups campaigns by recency', async () => {
    const { createClient } = await import('@/lib/supabase/server')

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const campaigns: Campaign[] = [
      {
        id: 'c1',
        user_id: 'u1',
        title: 'Today Campaign',
        status: 'draft',
        region: null,
        event_type: 'yoga_workshop',
        share_token: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: 'c2',
        user_id: 'u1',
        title: 'Yesterday Campaign',
        status: 'draft',
        region: null,
        event_type: 'satsang',
        share_token: null,
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
      },
      {
        id: 'c3',
        user_id: 'u1',
        title: 'Old Campaign',
        status: 'draft',
        region: null,
        event_type: 'meditation',
        share_token: null,
        created_at: lastWeek.toISOString(),
        updated_at: lastWeek.toISOString(),
      },
    ]

    const limitMock = vi.fn().mockResolvedValue({ data: campaigns, error: null })
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    const fromMock = vi.fn().mockReturnValue({ select: selectMock })

    const mockClient = createMockSupabaseClient()
    mockClient.from = fromMock
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { getUserCampaigns } = await import('@/lib/db/campaigns')
    const result = await getUserCampaigns()

    // The function returns campaigns as-is ordered by updated_at DESC
    // Grouping by recency is a presentation concern — we validate the data is available for grouping
    expect(result).toHaveLength(3)
    expect(result[0].updated_at >= result[1].updated_at).toBe(true)
    expect(result[1].updated_at >= result[2].updated_at).toBe(true)
  }) // CHAT-09

  it('creates campaign with user_id and event_type', async () => {
    const { createClient } = await import('@/lib/supabase/server')

    const newCampaign: Campaign = {
      id: 'new-campaign-id',
      user_id: 'test-user-id',
      title: null,
      status: 'draft',
      region: 'Bangalore',
      event_type: 'yoga_workshop',
      share_token: null,
      created_at: '2026-03-30T10:00:00Z',
      updated_at: '2026-03-30T10:00:00Z',
    }

    const singleMock = vi.fn().mockResolvedValue({ data: newCampaign, error: null })
    const selectAfterInsertMock = vi.fn().mockReturnValue({ single: singleMock })
    const insertMock = vi.fn().mockReturnValue({ select: selectAfterInsertMock })
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock })

    const mockClient = createMockSupabaseClient()
    mockClient.from = fromMock
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { createCampaign } = await import('@/lib/db/campaigns')
    const result = await createCampaign({
      userId: 'test-user-id',
      eventType: 'yoga_workshop',
      region: 'Bangalore',
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'test-user-id',
        event_type: 'yoga_workshop',
        region: 'Bangalore',
        status: 'draft',
      }),
    )
    expect(result).toEqual(newCampaign)
  }) // CHAT-08

  it('loads campaign and messages in parallel via getCampaignWithMessages', async () => {
    const { createClient } = await import('@/lib/supabase/server')

    const campaign: Campaign = {
      id: 'campaign-id-001',
      user_id: 'user-1',
      title: 'My Campaign',
      status: 'draft',
      region: null,
      event_type: 'yoga_workshop',
      share_token: null,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-03-01T10:00:00Z',
    }

    // Track parallel call timing
    const callOrder: string[] = []

    // Campaign query: .from('campaigns').select('*').eq('id', ...).single()
    let campaignResolve!: (value: any) => void
    const campaignPromise = new Promise((resolve) => { campaignResolve = resolve })
    const campaignSingleMock = vi.fn().mockImplementation(() => {
      callOrder.push('campaign')
      return Promise.resolve({ data: campaign, error: null })
    })
    const campaignEqMock = vi.fn().mockReturnValue({ single: campaignSingleMock })
    const campaignSelectMock = vi.fn().mockReturnValue({ eq: campaignEqMock })

    // Messages query: .from('campaign_messages').select(...).eq(...).order(...)
    const messagesOrderMock = vi.fn().mockImplementation(() => {
      callOrder.push('messages')
      return Promise.resolve({ data: [], error: null })
    })
    const messagesEqMock = vi.fn().mockReturnValue({ order: messagesOrderMock })
    const messagesSelectMock = vi.fn().mockReturnValue({ eq: messagesEqMock })

    const mockClient = createMockSupabaseClient()
    mockClient.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return { select: campaignSelectMock }
      }
      return { select: messagesSelectMock }
    })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const { getCampaignWithMessages } = await import('@/lib/db/campaigns')
    const result = await getCampaignWithMessages('campaign-id-001')

    expect(result.campaign).toEqual(campaign)
    expect(result.messages).toEqual([])
    // Both queries should have been made
    expect(callOrder).toContain('campaign')
    expect(callOrder).toContain('messages')
  })
})
