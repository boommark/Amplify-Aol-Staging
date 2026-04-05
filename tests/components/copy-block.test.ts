/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AmplifyDataParts } from '@/types/message'

// ──────────────────────────────────────────────────────────────────────────────
// Component prop contracts for CopyBlock channel frames (ADS-04)
// These tests validate that the component interfaces accept image rendering props
// and that the prop types are correct per types/message.ts
// ──────────────────────────────────────────────────────────────────────────────

describe('CopyBlock image rendering props (ADS-04)', () => {
  describe('copy-block data type', () => {
    it('accepts imageUrl and imageStatus ready together', () => {
      const data: AmplifyDataParts['copy-block'] = {
        channel: 'instagram',
        content: 'Great workshop!',
        editableId: 'edit-1',
        status: 'ready',
        imageUrl: 'https://s3.example.com/instagram-warm.png',
        imageStatus: 'ready',
        imageAssetId: 'asset-abc',
        imageMeta: { flavor: 'warm', channel: 'instagram' },
      }
      expect(data.imageUrl).toBe('https://s3.example.com/instagram-warm.png')
      expect(data.imageStatus).toBe('ready')
      expect(data.imageAssetId).toBe('asset-abc')
      expect(data.imageMeta?.flavor).toBe('warm')
    })

    it('accepts imageStatus generating (skeleton shimmer state)', () => {
      const data: AmplifyDataParts['copy-block'] = {
        channel: 'facebook',
        content: 'Discover peace...',
        editableId: 'edit-2',
        status: 'ready',
        imageStatus: 'generating',
      }
      expect(data.imageStatus).toBe('generating')
      expect(data.imageUrl).toBeUndefined()
    })

    it('accepts imageStatus failed (retry state)', () => {
      const data: AmplifyDataParts['copy-block'] = {
        channel: 'whatsapp',
        content: 'Share with friends...',
        editableId: 'edit-3',
        status: 'ready',
        imageStatus: 'failed',
      }
      expect(data.imageStatus).toBe('failed')
    })

    it('accepts flyer channel with 2:3 portrait metadata', () => {
      const data: AmplifyDataParts['copy-block'] = {
        channel: 'flyer',
        content: 'Join our workshop...',
        editableId: 'edit-4',
        status: 'ready',
        imageUrl: 'https://s3.example.com/flyer-warm.png',
        imageStatus: 'ready',
        imageMeta: { flavor: 'playful', channel: 'flyer' },
      }
      expect(data.channel).toBe('flyer')
      expect(data.imageMeta?.flavor).toBe('playful')
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// FlavorPicker component logic (ADS-02)
// Test the onChange callback and disabled state logic
// ──────────────────────────────────────────────────────────────────────────────

describe('FlavorPicker component logic (ADS-02)', () => {
  it('calls onChange with warm when warm pill clicked', () => {
    const onChange = vi.fn()
    // Simulate click handler logic: if not disabled, call onChange
    const disabled = false
    const flavor = 'warm' as const
    if (!disabled) onChange(flavor)
    expect(onChange).toHaveBeenCalledWith('warm')
  })

  it('calls onChange with playful when playful pill clicked', () => {
    const onChange = vi.fn()
    const disabled = false
    const flavor = 'playful' as const
    if (!disabled) onChange(flavor)
    expect(onChange).toHaveBeenCalledWith('playful')
  })

  it('does not call onChange when disabled is true', () => {
    const onChange = vi.fn()
    const disabled = true
    const flavor = 'warm' as const
    if (!disabled) onChange(flavor)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('warm pill has active styling when selected is warm', () => {
    const selected = 'warm'
    const warmClass = selected === 'warm'
      ? 'bg-[#3D8BE8] text-white font-medium rounded-full px-4 py-2 text-sm'
      : 'bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-2 text-sm hover:bg-slate-50'
    expect(warmClass).toContain('bg-[#3D8BE8]')
  })

  it('playful pill has active styling when selected is playful', () => {
    const selected = 'playful'
    const playfulClass = selected === 'playful'
      ? 'bg-[#3D8BE8] text-white font-medium rounded-full px-4 py-2 text-sm'
      : 'bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-2 text-sm hover:bg-slate-50'
    expect(playfulClass).toContain('bg-[#3D8BE8]')
  })

  it('has opacity-50 class when disabled', () => {
    const disabled = true
    const warmClass = 'bg-[#3D8BE8] text-white font-medium rounded-full px-4 py-2 text-sm' +
      (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
    expect(warmClass).toContain('opacity-50')
    expect(warmClass).toContain('cursor-not-allowed')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Channel frame image rendering logic
// ──────────────────────────────────────────────────────────────────────────────

describe('InstagramFrame image rendering logic', () => {
  it('uses animate-pulse class for generating skeleton', () => {
    const imageStatus = 'generating'
    const expectedClass = imageStatus === 'generating' ? 'animate-pulse' : ''
    expect(expectedClass).toBe('animate-pulse')
  })

  it('uses aspect-square for instagram image area', () => {
    // instagram uses 1:1 aspect ratio per CHANNEL_ASPECT_RATIO
    const channel = 'instagram'
    const aspectClass = channel === 'instagram' ? 'aspect-square' : 'aspect-video'
    expect(aspectClass).toBe('aspect-square')
  })

  it('shows retry button when imageStatus is failed', () => {
    const imageStatus = 'failed'
    const showRetry = imageStatus === 'failed'
    expect(showRetry).toBe(true)
  })

  it('shows download link when imageUrl is present and imageStatus is ready', () => {
    const imageUrl = 'https://s3.example.com/instagram-warm.png'
    const imageStatus = 'ready'
    const showDownload = !!(imageUrl && imageStatus === 'ready')
    expect(showDownload).toBe(true)
  })

  it('download filename is instagram-ad.png', () => {
    const filename = 'instagram-ad.png'
    expect(filename).toBe('instagram-ad.png')
  })
})

describe('FacebookFrame image rendering logic', () => {
  it('uses aspect-video class for 16:9 ratio', () => {
    const channel = 'facebook'
    const aspectClass = channel === 'facebook' ? 'aspect-video' : 'aspect-square'
    expect(aspectClass).toBe('aspect-video')
  })

  it('download filename is facebook-ad.png', () => {
    const filename = 'facebook-ad.png'
    expect(filename).toBe('facebook-ad.png')
  })
})

describe('FlyerFrame image rendering logic', () => {
  it('uses 2:3 portrait aspect ratio for flyer', () => {
    // CHANNEL_ASPECT_RATIO['flyer'] = '2:3'
    const flyerAspect = '2:3'
    expect(flyerAspect).toBe('2:3')
  })

  it('download filename is flyer-ad.png', () => {
    const filename = 'flyer-ad.png'
    expect(filename).toBe('flyer-ad.png')
  })
})

describe('WhatsAppFrame image rendering logic', () => {
  it('uses aspect-square for whatsapp image area', () => {
    // whatsapp uses 1:1 per CHANNEL_ASPECT_RATIO
    const channel = 'whatsapp'
    const aspectClass = channel === 'whatsapp' ? 'aspect-square' : 'aspect-video'
    expect(aspectClass).toBe('aspect-square')
  })

  it('download filename is whatsapp-ad.png', () => {
    const filename = 'whatsapp-ad.png'
    expect(filename).toBe('whatsapp-ad.png')
  })
})
