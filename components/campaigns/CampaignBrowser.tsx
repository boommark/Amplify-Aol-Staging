'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import type { Campaign } from '@/types/campaign'
import type { CampaignAsset } from '@/lib/db/assets'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignWithMeta extends Campaign {
  thumbnail_url?: string | null
  asset_count?: number
}

// ---------------------------------------------------------------------------
// Pure filtering utility — exported for unit testing
// ---------------------------------------------------------------------------

export function filterCampaigns(
  campaigns: CampaignWithMeta[],
  searchQuery: string,
  eventTypeFilter: string
): CampaignWithMeta[] {
  return campaigns.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !eventTypeFilter || c.event_type === eventTypeFilter
    return matchesSearch && matchesType
  })
}

// ---------------------------------------------------------------------------
// Event type options
// ---------------------------------------------------------------------------

const EVENT_TYPE_OPTIONS = [
  'Happiness Program',
  'Sahaj Samadhi',
  'Sleep & Anxiety',
  'Sri Sri Yoga',
  'Art of Silence',
  'YES!+',
]

// ---------------------------------------------------------------------------
// Channel sections for detail view
// ---------------------------------------------------------------------------

const CHANNELS = ['email', 'whatsapp', 'instagram', 'facebook', 'flyer'] as const

// ---------------------------------------------------------------------------
// CopyButton — shows "Copy" and toggles "Copied!" for 2 seconds
// ---------------------------------------------------------------------------

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
      style={{ fontFamily: 'Work Sans, sans-serif' }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// CampaignBrowser — main exported component
// ---------------------------------------------------------------------------

export function CampaignBrowser() {
  const [campaigns, setCampaigns] = useState<CampaignWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [campaignAssets, setCampaignAssets] = useState<CampaignAsset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  // Load campaigns on mount
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns')
        if (res.ok) {
          const data: CampaignWithMeta[] = await res.json()
          setCampaigns(data)
        }
      } catch {
        // Silent failure — non-critical list view
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  // Load assets and share token when a campaign is selected
  const handleSelectCampaign = useCallback(async (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setAssetsLoading(true)
    setCampaignAssets([])
    setShareUrl(null)
    setShareCopied(false)
    try {
      const [assetsRes, shareRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}/assets`),
        fetch(`/api/campaigns/${campaignId}/share`),
      ])
      if (assetsRes.ok) {
        const assets: CampaignAsset[] = await assetsRes.json()
        setCampaignAssets(assets)
      }
      if (shareRes.ok) {
        const shareData: { shareUrl: string | null } = await shareRes.json()
        setShareUrl(shareData.shareUrl)
      }
    } catch {
      // Silent
    } finally {
      setAssetsLoading(false)
    }
  }, [])

  const handleGenerateShareLink = async () => {
    if (!selectedCampaignId) return
    setShareLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${selectedCampaignId}/share`, { method: 'POST' })
      if (res.ok) {
        const data: { shareUrl: string } = await res.json()
        setShareUrl(data.shareUrl)
      }
    } catch {
      // Silent
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyShareLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)
  const filtered = filterCampaigns(campaigns, searchQuery, eventTypeFilter)

  // -------------------------------------------------------------------------
  // Detail view
  // -------------------------------------------------------------------------

  if (selectedCampaign) {
    return (
      <div>
        {/* Back link */}
        <button
          onClick={() => {
            setSelectedCampaignId(null)
            setCampaignAssets([])
          }}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to campaigns
        </button>

        {/* Campaign header */}
        <div className="mb-8">
          <h2
            className="text-xl font-semibold text-slate-900 mb-1"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            {selectedCampaign.title ?? 'Untitled Campaign'}
          </h2>
          <div className="flex flex-wrap gap-3 text-sm text-slate-500" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            {selectedCampaign.region && <span>{selectedCampaign.region}</span>}
            {selectedCampaign.event_type && <span>· {selectedCampaign.event_type}</span>}
            <span>· {format(new Date(selectedCampaign.created_at), 'MMM d, yyyy')}</span>
          </div>

          {/* Export and Share actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            {/* Download All (ZIP) */}
            <a
              href={`/api/campaigns/${selectedCampaignId}/export`}
              download
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All (ZIP)
            </a>

            {/* Share button */}
            {shareUrl ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 w-64 focus:outline-none"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                />
                <button
                  onClick={handleCopyShareLink}
                  className="text-sm px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                >
                  {shareCopied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateShareLink}
                disabled={shareLoading}
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium disabled:opacity-50"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {shareLoading ? 'Generating...' : 'Share'}
              </button>
            )}
          </div>
        </div>

        {/* Assets by channel */}
        {assetsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {CHANNELS.map((channel) => {
              const channelAssets = campaignAssets.filter(
                (a) => a.channel === channel
              )

              return (
                <div key={channel}>
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 capitalize"
                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                  >
                    {channel}
                  </h3>

                  {channelAssets.length === 0 ? (
                    <p
                      className="text-sm text-slate-400 italic py-4 px-4 rounded-lg border border-dashed border-slate-200"
                      style={{ fontFamily: 'Work Sans, sans-serif' }}
                    >
                      No assets yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {channelAssets.map((asset) => {
                        // Image assets
                        if (
                          asset.asset_type === 'image' ||
                          asset.asset_type === 'ad_creative' ||
                          asset.asset_type === 'quote_image'
                        ) {
                          return (
                            <div
                              key={asset.id}
                              className="rounded-lg border border-slate-200 overflow-hidden bg-white"
                            >
                              {asset.s3_url && (
                                <img
                                  src={asset.s3_url}
                                  alt={`${channel} ${asset.asset_type}`}
                                  className="w-full object-cover max-h-64"
                                />
                              )}
                              <div className="p-3 flex justify-end">
                                {asset.s3_url && (
                                  <a
                                    href={asset.s3_url}
                                    download={`${channel}-${asset.asset_type}.png`}
                                    className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                                  >
                                    Download
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        }

                        // Copy assets
                        return (
                          <div
                            key={asset.id}
                            className="rounded-lg border border-slate-200 bg-white"
                          >
                            <div className="p-4">
                              <pre
                                className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed"
                                style={{ fontFamily: 'Work Sans, sans-serif' }}
                              >
                                {asset.content ?? ''}
                              </pre>
                            </div>
                            <div className="px-4 pb-3 flex justify-end border-t border-slate-100 pt-2">
                              <CopyButton content={asset.content ?? ''} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Grid / list view
  // -------------------------------------------------------------------------

  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title or region..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        />
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          <option value="">All event types</option>
          {EVENT_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Campaign grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            {campaigns.length === 0
              ? 'No campaigns yet. Start a new campaign to get going.'
              : 'No campaigns match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => handleSelectCampaign(campaign.id)}
              className="rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer text-left bg-white"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-100 relative">
                {campaign.thumbnail_url ? (
                  <img
                    src={campaign.thumbnail_url}
                    alt={campaign.title ?? 'Campaign thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4">
                <p
                  className="font-medium text-slate-900 truncate"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                >
                  {campaign.title ?? 'Untitled Campaign'}
                </p>
                <p
                  className="text-sm text-slate-500 mt-0.5 truncate"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                >
                  {[campaign.region, campaign.event_type].filter(Boolean).join(' · ')}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="text-xs text-slate-400"
                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                  >
                    {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                  </span>
                  {typeof campaign.asset_count === 'number' && (
                    <span
                      className="text-xs bg-slate-100 rounded-full px-2 py-0.5 text-slate-500"
                      style={{ fontFamily: 'Work Sans, sans-serif' }}
                    >
                      {campaign.asset_count} asset{campaign.asset_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
