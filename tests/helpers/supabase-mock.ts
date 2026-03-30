import { vi } from 'vitest'
import type { Campaign, CampaignMessage } from '@/types/campaign'

export function createMockSupabaseClient(overrides: Record<string, any> = {}) {
  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      admin: {
        updateUserById: vi.fn().mockResolvedValue({ error: null }),
      },
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    ...overrides,
  }
  return mockClient
}

export function mockAuthUser(role = 'teacher', email = 'test@example.com') {
  return {
    id: 'test-user-id',
    email,
    app_metadata: { role },
    user_metadata: { full_name: 'Test User' },
  }
}

export function mockCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'campaign-id-001',
    user_id: 'test-user-id',
    title: 'Test Yoga Workshop — March 2026',
    status: 'draft',
    region: 'Bangalore',
    event_type: 'yoga_workshop',
    share_token: null,
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T10:00:00.000Z',
    ...overrides,
  }
}

export function mockCampaignMessage(overrides: Partial<CampaignMessage> = {}): CampaignMessage {
  return {
    id: 'message-id-001',
    campaign_id: 'campaign-id-001',
    role: 'user',
    content: 'Create marketing content for my yoga workshop',
    parts: null,
    model: null,
    created_at: '2026-03-01T10:01:00.000Z',
    ...overrides,
  }
}
