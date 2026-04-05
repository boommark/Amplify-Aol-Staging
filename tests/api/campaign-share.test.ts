import { describe, it } from 'vitest'

describe('campaign share token (CAMP-05)', () => {
  it.todo('POST generates new UUID share token when none exists')
  it.todo('POST returns existing share token when one already exists')
  it.todo('POST returns 404 for non-existent campaign')
  it.todo('GET returns shareUrl when token exists')
  it.todo('GET returns null shareUrl when no token exists')
})

describe('public share page (CAMP-05)', () => {
  it.todo('renders campaign assets read-only for valid share token')
  it.todo('returns 404 for invalid share token')
  it.todo('uses admin client to bypass RLS for share token lookup')
})
