import { describe, it } from 'vitest'

describe('image refinement (ADS-05)', () => {
  it.todo('loads existing asset metadata including promptUsed')
  it.todo('appends refinement instruction to previous prompt')
  it.todo('calls generateAdCreativeImage with combined prompt')
  it.todo('updates existing asset via updateAssetContent with new S3 URL')
  it.todo('preserves original flavor in metadata')
  it.todo('does not affect copy content for the same channel')
  it.todo('does not affect other channel images')
})
