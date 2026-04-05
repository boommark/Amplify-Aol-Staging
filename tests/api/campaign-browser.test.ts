import { describe, it } from 'vitest'

describe('campaign browser (CAMP-02)', () => {
  it.todo('renders campaign card grid with thumbnail, region, event type, date')
  it.todo('filters campaigns by search query matching title')
  it.todo('filters campaigns by search query matching region')
  it.todo('filters campaigns by event type dropdown')
  it.todo('combined search and filter returns intersection')
  it.todo('empty search shows all campaigns')
})

describe('individual asset access (CAMP-03)', () => {
  it.todo('copy-to-clipboard calls navigator.clipboard.writeText with content')
  it.todo('image download link has correct href and download attribute')
  it.todo('campaign detail view shows assets organized by channel')
})
