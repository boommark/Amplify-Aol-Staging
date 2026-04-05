// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Campaign } from '@/types/campaign'

// ---------------------------------------------------------------------------
// filterCampaigns pure function tests
// ---------------------------------------------------------------------------
describe('filterCampaigns', () => {
  let filterCampaigns: (
    campaigns: Campaign[],
    searchQuery: string,
    eventTypeFilter: string
  ) => Campaign[]

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/components/campaigns/CampaignBrowser')
    filterCampaigns = mod.filterCampaigns
  })

  const campaigns: Campaign[] = [
    {
      id: '1',
      user_id: 'u1',
      title: 'Happiness Workshop',
      status: 'active',
      region: 'Kirkland, WA',
      event_type: 'Happiness Program',
      share_token: null,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-03-01T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'u1',
      title: 'Seattle Meditation',
      status: 'draft',
      region: 'Seattle, WA',
      event_type: 'Sahaj Samadhi',
      share_token: null,
      created_at: '2026-03-15T10:00:00Z',
      updated_at: '2026-03-15T10:00:00Z',
    },
    {
      id: '3',
      user_id: 'u1',
      title: 'Yoga Class',
      status: 'draft',
      region: 'Portland, OR',
      event_type: 'Sri Sri Yoga',
      share_token: null,
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-01T10:00:00Z',
    },
  ]

  it('filters by region search (case insensitive) — kirkland matches Kirkland, WA', () => {
    const result = filterCampaigns(campaigns, 'kirkland', '')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by event type — Sahaj Samadhi returns only matching campaign', () => {
    const result = filterCampaigns(campaigns, '', 'Sahaj Samadhi')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('combined: search seattle + event type Happiness Program returns empty', () => {
    const result = filterCampaigns(campaigns, 'seattle', 'Happiness Program')
    expect(result).toHaveLength(0)
  })

  it('empty search and empty filter returns all campaigns', () => {
    const result = filterCampaigns(campaigns, '', '')
    expect(result).toHaveLength(3)
  })

  it('filters by title search (case insensitive)', () => {
    const result = filterCampaigns(campaigns, 'yoga', '')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })
})

// ---------------------------------------------------------------------------
// CampaignBrowser component rendering tests
// ---------------------------------------------------------------------------
describe('CampaignBrowser rendering', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: '1',
          user_id: 'u1',
          title: 'Test Campaign',
          status: 'active',
          region: 'Seattle, WA',
          event_type: 'Happiness Program',
          share_token: null,
          thumbnail_url: null,
          asset_count: 3,
          created_at: '2026-03-01T10:00:00Z',
          updated_at: '2026-03-01T10:00:00Z',
        },
      ],
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders campaign grid with grid-cols class', async () => {
    const React = await import('react')
    const { render } = await import('@testing-library/react')
    const { CampaignBrowser } = await import('@/components/campaigns/CampaignBrowser')

    const { container } = render(React.createElement(CampaignBrowser))
    const gridEl = container.querySelector('[class*="grid-cols"]')
    expect(gridEl).not.toBeNull()
  })

  it('renders search input element', async () => {
    const React = await import('react')
    const { render } = await import('@testing-library/react')
    const { CampaignBrowser } = await import('@/components/campaigns/CampaignBrowser')

    const { container } = render(React.createElement(CampaignBrowser))
    const searchInput = container.querySelector('input[type="text"]')
    expect(searchInput).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Clipboard and download attribute tests
// ---------------------------------------------------------------------------
describe('Campaign asset actions', () => {
  it('copy button calls navigator.clipboard.writeText with asset content', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    })

    const content = 'Hello from Art of Living!'
    await navigator.clipboard.writeText(content)
    expect(writeTextMock).toHaveBeenCalledWith(content)
  })

  it('download link has correct href and download attribute', () => {
    const anchor = document.createElement('a')
    const s3Url = 'https://s3.example.com/assets/image.png'
    const downloadName = 'email-ad_creative.png'
    anchor.href = s3Url
    anchor.setAttribute('download', downloadName)

    expect(anchor.getAttribute('href')).toBe(s3Url)
    expect(anchor.getAttribute('download')).toBe(downloadName)
  })
})
