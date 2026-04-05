import { describe, it } from 'vitest'

describe('campaign ZIP export (CAMP-04)', () => {
  it.todo('returns 401 when no authenticated user')
  it.todo('returns 404 when campaign does not belong to user')
  it.todo('returns 404 when no assets exist')
  it.todo('returns Content-Type application/zip')
  it.todo('Content-Disposition header includes campaign title')
  it.todo('archive includes image files with channel-based filenames')
  it.todo('archive includes copy files as text')
})
