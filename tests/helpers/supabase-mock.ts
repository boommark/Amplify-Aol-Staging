import { vi } from 'vitest'

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
