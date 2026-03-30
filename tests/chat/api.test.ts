import { describe, it } from 'vitest'

describe('POST /api/chat', () => {
  it.todo('returns 401 for unauthenticated request') // INFRA-07
  it.todo('returns streaming response for authenticated user') // CHAT-02
  it.todo('accepts tone parameter in request body') // CHAT-07
})
