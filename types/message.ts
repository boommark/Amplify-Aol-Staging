import type { UIMessage } from 'ai'

export type AmplifyDataParts = {
  'research-card': {
    topic: string
    summary?: string
    findings: Array<{ label: string; value: string; source?: string }>
    status: 'loading' | 'ready'
  }
  'copy-block': {
    channel: 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'flyer' | string
    content: string
    editableId: string
    status: 'loading' | 'ready'
    imageUrl?: string
    imageAssetId?: string
    imageStatus?: 'generating' | 'ready' | 'failed'
    imageMeta?: {
      flavor: 'warm' | 'playful'
      channel: string
      promptUsed?: string
    }
  }
  'image-carousel': {
    images: Array<{ url: string; aspectRatio: '1:1' | '9:16' | '16:9'; prompt?: string }>
    selectable: boolean
    status: 'loading' | 'ready'
  }
  'ad-preview': {
    imageUrl: string
    adType: string
    orientation: 'square' | 'vertical' | 'horizontal'
    status: 'loading' | 'ready'
  }
  'action-chips': {
    chips: Array<{ label: string; prompt: string }>
  }
  'quote-card': {
    quoteId: string
    short: string
    medium: string
    long: string
    source: string
    category: string
    date?: string
    location?: string
    event?: string
    imageUrl?: string
    isManual: boolean
    status: 'loading' | 'ready'
  }
  'stage-progress': {
    stages: Array<{ id: 'research' | 'wisdom' | 'copy'; label: string; state: 'pending' | 'active' | 'completed' }>
  }
}

export type AmplifyUIMessage = UIMessage<never, AmplifyDataParts>
