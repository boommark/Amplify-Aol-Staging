import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AmplifyDataParts } from '@/types/message'
import { TASK_MODEL_MAP } from '@/lib/ai/models'

// ──────────────────────────────────────────────────────────────────────────────
// Task 1: Type contracts and model map
// ──────────────────────────────────────────────────────────────────────────────

describe('copy-block type contracts (ADS-02, ADS-03)', () => {
  it('copy-block type includes optional imageUrl field', () => {
    const block: AmplifyDataParts['copy-block'] = {
      channel: 'instagram',
      content: 'Test content',
      editableId: 'editable-1',
      status: 'ready',
      imageUrl: 'https://s3.example.com/image.png',
    }
    expect(block.imageUrl).toBe('https://s3.example.com/image.png')
  })

  it('copy-block type includes optional imageAssetId field', () => {
    const block: AmplifyDataParts['copy-block'] = {
      channel: 'facebook',
      content: 'Test content',
      editableId: 'editable-2',
      status: 'ready',
      imageAssetId: 'asset-uuid-123',
    }
    expect(block.imageAssetId).toBe('asset-uuid-123')
  })

  it('copy-block type includes optional imageStatus field', () => {
    const block: AmplifyDataParts['copy-block'] = {
      channel: 'whatsapp',
      content: 'Test',
      editableId: 'e3',
      status: 'ready',
      imageStatus: 'generating',
    }
    expect(block.imageStatus).toBe('generating')
  })

  it('copy-block type includes optional imageMeta field', () => {
    const block: AmplifyDataParts['copy-block'] = {
      channel: 'instagram',
      content: 'Test content',
      editableId: 'editable-6',
      status: 'ready',
      imageMeta: {
        flavor: 'warm',
        channel: 'instagram',
        promptUsed: 'Generate a 1:1 photograph...',
      },
    }
    expect(block.imageMeta?.flavor).toBe('warm')
    expect(block.imageMeta?.channel).toBe('instagram')
  })
})

describe('TASK_MODEL_MAP channel-specific image keys (ADS-01)', () => {
  it('has image.ad-creative.instagram key', () => {
    expect('image.ad-creative.instagram' in TASK_MODEL_MAP).toBe(true)
    const entry = TASK_MODEL_MAP['image.ad-creative.instagram' as keyof typeof TASK_MODEL_MAP]
    expect(entry.label).toBe('Nano Banana 2')
  })

  it('has image.ad-creative.facebook key', () => {
    expect('image.ad-creative.facebook' in TASK_MODEL_MAP).toBe(true)
    const entry = TASK_MODEL_MAP['image.ad-creative.facebook' as keyof typeof TASK_MODEL_MAP]
    expect(entry.label).toBe('Nano Banana 2')
  })

  it('has image.ad-creative.whatsapp key', () => {
    expect('image.ad-creative.whatsapp' in TASK_MODEL_MAP).toBe(true)
    const entry = TASK_MODEL_MAP['image.ad-creative.whatsapp' as keyof typeof TASK_MODEL_MAP]
    expect(entry.label).toBe('Nano Banana 2')
  })

  it('has image.ad-creative.flyer key', () => {
    expect('image.ad-creative.flyer' in TASK_MODEL_MAP).toBe(true)
    const entry = TASK_MODEL_MAP['image.ad-creative.flyer' as keyof typeof TASK_MODEL_MAP]
    expect(entry.label).toBe('Nano Banana 2')
  })

  it('image.ad-creative base key is Nano Banana 2', () => {
    expect(TASK_MODEL_MAP['image.ad-creative'].label).toBe('Nano Banana 2')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Task 2: Pipeline module tests
// ──────────────────────────────────────────────────────────────────────────────

vi.mock('@/lib/db/assets', () => ({
  saveAsset: vi.fn(),
  updateAssetContent: vi.fn(),
  getAssetsForCampaign: vi.fn(),
}))

vi.mock('@/lib/s3/presigned-url', () => ({
  generatePresignedUploadUrl: vi.fn(),
}))

vi.mock('@/lib/prompts/registry', () => ({
  loadPrompt: vi.fn(),
}))

vi.mock('@/lib/prompts/renderer', () => ({
  renderPrompt: vi.fn((template: string, vars: Record<string, string>) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => vars[key] ?? '')
  }),
}))

describe('generateAdCreativeImage (ADS-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns S3 URL on successful generation', async () => {
    const { generateAdCreativeImage } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?signature=xxx' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id-1' } as any)

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { text: 'Generated' },
            { inlineData: { mimeType: 'image/png', data: Buffer.from('fake').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    const result = await generateAdCreativeImage({
      prompt: 'A beautiful photograph',
      channel: 'instagram',
      flavor: 'warm',
      campaignId: 'campaign-1',
      userId: 'user-1',
    })

    expect(result).not.toBeNull()
    expect(result?.imageUrl).toBe('https://s3.example.com/upload')
  })

  it('returns null when API returns non-ok response', async () => {
    const { generateAdCreativeImage } = await import('@/lib/pipeline/ad-creative-image')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad request',
    } as any)

    const result = await generateAdCreativeImage({
      prompt: 'A photograph',
      channel: 'instagram',
      flavor: 'warm',
      campaignId: 'campaign-1',
      userId: 'user-1',
    })

    expect(result).toBeNull()
  })

  it('calls fetch with gemini-2.5-flash-image:generateContent endpoint', async () => {
    const { generateAdCreativeImage } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id-2' } as any)

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    global.fetch = mockFetch

    await generateAdCreativeImage({
      prompt: 'Test prompt',
      channel: 'facebook',
      flavor: 'playful',
      campaignId: 'campaign-2',
      userId: 'user-2',
    })

    const firstCallUrl = mockFetch.mock.calls[0][0] as string
    expect(firstCallUrl).toContain('gemini-2.5-flash-image')
    expect(firstCallUrl).toContain(':generateContent')
  })

  it('includes responseModalities TEXT and IMAGE in request body', async () => {
    const { generateAdCreativeImage } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id-3' } as any)

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    global.fetch = mockFetch

    await generateAdCreativeImage({
      prompt: 'Test',
      channel: 'whatsapp',
      flavor: 'warm',
      campaignId: 'campaign-3',
      userId: 'user-3',
    })

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(requestBody.generationConfig.responseModalities).toContain('TEXT')
    expect(requestBody.generationConfig.responseModalities).toContain('IMAGE')
  })

  it('uploads image to S3 at correct path pattern', async () => {
    const { generateAdCreativeImage } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id-4' } as any)

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    await generateAdCreativeImage({
      prompt: 'Test',
      channel: 'flyer',
      flavor: 'warm',
      campaignId: 'campaign-abc',
      userId: 'user-xyz',
    })

    expect(generatePresignedUploadUrl).toHaveBeenCalledWith(
      expect.stringContaining('user-xyz/campaigns/campaign-abc/ad-creatives/flyer-warm'),
      'image/png',
      expect.any(Number)
    )
  })

  it('saves asset to campaign_assets with ad_creative type', async () => {
    const { generateAdCreativeImage } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id-5' } as any)

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    await generateAdCreativeImage({
      prompt: 'Test',
      channel: 'instagram',
      flavor: 'playful',
      campaignId: 'campaign-5',
      userId: 'user-5',
    })

    expect(saveAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: 'campaign-5',
        assetType: 'ad_creative',
        channel: 'instagram',
      })
    )
  })
})

describe('generateAllAdCreatives (ADS-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates images for all 4 channels in parallel via Promise.allSettled', async () => {
    const { generateAllAdCreatives } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Photo of {{workshopTheme}} in {{region}}' } as any)
    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id' } as any)

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [
          { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
        ]}}],
      })
    } as any)

    const result = await generateAllAdCreatives({
      campaignId: 'campaign-all',
      userId: 'user-all',
      flavor: 'warm',
      workshopTheme: 'Sahaj Samadhi',
      region: 'Kirkland, WA',
      copyResults: [
        { channel: 'instagram', content: 'Find your calm...' },
        { channel: 'facebook', content: 'Discover peace...' },
        { channel: 'whatsapp', content: 'Share this...' },
        { channel: 'flyer', content: 'Join us...' },
      ],
    })

    expect(Object.keys(result)).toHaveLength(4)
  })

  it('calls onChannelComplete callback as each channel finishes', async () => {
    const { generateAllAdCreatives } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Photo of {{workshopTheme}}' } as any)
    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id' } as any)

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [
          { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
        ]}}],
      })
    } as any)

    const onChannelComplete = vi.fn()

    await generateAllAdCreatives({
      campaignId: 'campaign-cb',
      userId: 'user-cb',
      flavor: 'playful',
      workshopTheme: 'Happiness Program',
      region: 'Seattle, WA',
      copyResults: [
        { channel: 'instagram', content: 'Content 1' },
        { channel: 'facebook', content: 'Content 2' },
        { channel: 'whatsapp', content: 'Content 3' },
        { channel: 'flyer', content: 'Content 4' },
      ],
      onChannelComplete,
    })

    expect(onChannelComplete).toHaveBeenCalledTimes(4)
  })

  it('returns Record with instagram, facebook, whatsapp, flyer keys', async () => {
    const { generateAllAdCreatives } = await import('@/lib/pipeline/ad-creative-image')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')
    const { saveAsset } = await import('@/lib/db/assets')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Photo' } as any)
    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'asset-id' } as any)

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [
          { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
        ]}}],
      })
    } as any)

    const result = await generateAllAdCreatives({
      campaignId: 'campaign-keys',
      userId: 'user-keys',
      flavor: 'warm',
      workshopTheme: 'Sri Sri Yoga',
      region: 'Portland, OR',
      copyResults: [
        { channel: 'instagram', content: 'Content' },
        { channel: 'facebook', content: 'Content' },
        { channel: 'whatsapp', content: 'Content' },
        { channel: 'flyer', content: 'Content' },
      ],
    })

    expect(result).toHaveProperty('instagram')
    expect(result).toHaveProperty('facebook')
    expect(result).toHaveProperty('whatsapp')
    expect(result).toHaveProperty('flyer')
  })
})

describe('buildAdCreativePrompt (ADS-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('incorporates channel copy, workshop theme, region, and brand colors', async () => {
    const { buildAdCreativePrompt } = await import('@/lib/pipeline/ad-creative-image')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({
      template: 'Photo for {{workshopTheme}} in {{region}}. Copy: {{channelCopy}}. Colors: {{brandPalette}}'
    } as any)

    const result = await buildAdCreativePrompt({
      channel: 'instagram',
      flavor: 'warm',
      workshopTheme: 'Sahaj Samadhi',
      region: 'Kirkland, WA',
      channelCopy: 'Find your calm...',
    })

    expect(result).toContain('Sahaj Samadhi')
    expect(result).toContain('Kirkland')
    expect(result).toContain('Find your calm...')
    expect(result).toContain('#3D8BE8')
  })

  it('includes aspect ratio guidance per channel', async () => {
    const { buildAdCreativePrompt } = await import('@/lib/pipeline/ad-creative-image')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({
      template: '{{aspectRatio}} photo for {{workshopTheme}}'
    } as any)

    const instagramResult = await buildAdCreativePrompt({
      channel: 'instagram',
      flavor: 'warm',
      workshopTheme: 'Sahaj Samadhi',
      region: 'Seattle',
      channelCopy: 'Content',
    })
    expect(instagramResult).toContain('1:1')

    vi.mocked(loadPrompt).mockResolvedValue({
      template: '{{aspectRatio}} photo for {{workshopTheme}}'
    } as any)

    const facebookResult = await buildAdCreativePrompt({
      channel: 'facebook',
      flavor: 'warm',
      workshopTheme: 'Sahaj Samadhi',
      region: 'Seattle',
      channelCopy: 'Content',
    })
    expect(facebookResult).toContain('16:9')
  })

  it('fetches prompt template from Supabase prompts table with correct key', async () => {
    const { buildAdCreativePrompt } = await import('@/lib/pipeline/ad-creative-image')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Photo' } as any)

    await buildAdCreativePrompt({
      channel: 'instagram',
      flavor: 'warm',
      workshopTheme: 'Sahaj Samadhi',
      region: 'Seattle',
      channelCopy: 'Content',
    })

    expect(loadPrompt).toHaveBeenCalledWith('image.ad-creative.instagram.warm')
  })

  it('renders template with correct variables via renderPrompt', async () => {
    const { buildAdCreativePrompt } = await import('@/lib/pipeline/ad-creative-image')
    const { loadPrompt } = await import('@/lib/prompts/registry')
    const { renderPrompt } = await import('@/lib/prompts/renderer')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Template for {{workshopTheme}}' } as any)

    await buildAdCreativePrompt({
      channel: 'flyer',
      flavor: 'playful',
      workshopTheme: 'Happiness Program',
      region: 'Austin, TX',
      channelCopy: 'Join us!',
    })

    expect(renderPrompt).toHaveBeenCalled()
  })
})

describe('flavor selection (ADS-02)', () => {
  it('builds prompt key with warm flavor suffix', async () => {
    const { buildAdCreativePrompt } = await import('@/lib/pipeline/ad-creative-image')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Photo' } as any)

    await buildAdCreativePrompt({
      channel: 'instagram',
      flavor: 'warm',
      workshopTheme: 'Sahaj Samadhi',
      region: 'Seattle',
      channelCopy: 'Content',
    })

    expect(loadPrompt).toHaveBeenCalledWith('image.ad-creative.instagram.warm')
  })

  it('builds prompt key with playful flavor suffix', async () => {
    const { buildAdCreativePrompt } = await import('@/lib/pipeline/ad-creative-image')
    const { loadPrompt } = await import('@/lib/prompts/registry')

    vi.mocked(loadPrompt).mockResolvedValue({ template: 'Photo' } as any)

    await buildAdCreativePrompt({
      channel: 'facebook',
      flavor: 'playful',
      workshopTheme: 'Happiness Program',
      region: 'Austin',
      channelCopy: 'Content',
    })

    expect(loadPrompt).toHaveBeenCalledWith('image.ad-creative.facebook.playful')
  })
})

describe('refineChannelImage (ADS-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads existing asset metadata and appends instruction to previous prompt', async () => {
    const { refineChannelImage } = await import('@/lib/pipeline/ad-creative-image')
    const { getAssetsForCampaign, updateAssetContent, saveAsset } = await import('@/lib/db/assets')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')

    vi.mocked(getAssetsForCampaign).mockResolvedValue([{
      id: 'existing-asset-id',
      campaign_id: 'campaign-ref',
      asset_type: 'ad_creative',
      channel: 'instagram',
      content: null,
      s3_key: 'key.png',
      s3_url: 'https://s3.example.com/instagram-warm.png',
      metadata: {
        promptUsed: 'Original prompt text',
        flavor: 'warm',
        channel: 'instagram',
        generatedAt: '2026-04-05T00:00:00Z',
      },
      created_at: '2026-04-05T00:00:00Z',
    }])

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'new-asset-id' } as any)
    vi.mocked(updateAssetContent).mockResolvedValue(undefined)

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    global.fetch = mockFetch

    await refineChannelImage({
      assetId: 'existing-asset-id',
      campaignId: 'campaign-ref',
      channel: 'instagram',
      instruction: 'Make it warmer',
      userId: 'user-1',
    })

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    const promptText = requestBody.contents[0].parts[0].text
    expect(promptText).toContain('Original prompt text')
    expect(promptText).toContain('Make it warmer')
  })

  it('returns channel, imageUrl, and assetId on success', async () => {
    const { refineChannelImage } = await import('@/lib/pipeline/ad-creative-image')
    const { getAssetsForCampaign, updateAssetContent, saveAsset } = await import('@/lib/db/assets')
    const { generatePresignedUploadUrl } = await import('@/lib/s3/presigned-url')

    vi.mocked(getAssetsForCampaign).mockResolvedValue([{
      id: 'existing-asset-id-2',
      campaign_id: 'campaign-ref2',
      asset_type: 'ad_creative',
      channel: 'whatsapp',
      content: null,
      s3_key: 'key.png',
      s3_url: 'https://s3.example.com/old.png',
      metadata: {
        promptUsed: 'Original',
        flavor: 'playful',
        channel: 'whatsapp',
        generatedAt: '2026-04-05T00:00:00Z',
      },
      created_at: '2026-04-05T00:00:00Z',
    }])

    vi.mocked(generatePresignedUploadUrl).mockResolvedValue({ url: 'https://s3.example.com/upload?sig=x' })
    vi.mocked(saveAsset).mockResolvedValue({ id: 'refined-asset-id' } as any)
    vi.mocked(updateAssetContent).mockResolvedValue(undefined)

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [
            { inlineData: { mimeType: 'image/png', data: Buffer.from('img').toString('base64') } },
          ]}}],
        })
      } as any)
      .mockResolvedValueOnce({ ok: true } as any)

    const result = await refineChannelImage({
      assetId: 'existing-asset-id-2',
      campaignId: 'campaign-ref2',
      channel: 'whatsapp',
      instruction: 'Different angle',
      userId: 'user-2',
    })

    expect(result).toHaveProperty('channel', 'whatsapp')
    expect(result).toHaveProperty('imageUrl')
    expect(result).toHaveProperty('assetId')
  })
})
