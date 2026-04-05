'use client'

import type { CampaignAsset } from '@/lib/db/assets'

const CHANNELS = ['email', 'whatsapp', 'instagram', 'facebook', 'flyer'] as const

interface ShareableCampaignViewProps {
  assets: CampaignAsset[]
}

export function ShareableCampaignView({ assets }: ShareableCampaignViewProps) {
  // Collect all unique channels from assets, ordered by CHANNELS priority then alphabetically
  const channelOrder = [...CHANNELS] as string[]
  const assetChannels = [...new Set(assets.map((a) => a.channel || 'other'))]
  const allChannels = [
    ...channelOrder.filter((c) => assetChannels.includes(c)),
    ...assetChannels.filter((c) => !channelOrder.includes(c)),
  ]

  if (assets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          No assets available for this campaign.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {allChannels.map((channel) => {
        const channelAssets = assets.filter((a) => (a.channel || 'other') === channel)
        if (channelAssets.length === 0) return null

        return (
          <div key={channel}>
            <h2
              className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 capitalize"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              {channel}
            </h2>

            <div className="space-y-3">
              {channelAssets.map((asset) => {
                // Image assets — read only, no download button
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
                    </div>
                  )
                }

                // Copy assets — read only, no copy button
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
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
