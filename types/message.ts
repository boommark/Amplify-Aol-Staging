import type { UIMessage } from 'ai'

export type AmplifyDataParts = {
  'research-card': {
    topic: string
    findings: Array<{ label: string; value: string; source?: string }>
    status: 'loading' | 'ready'
  }
  'copy-block': {
    channel: 'email' | 'whatsapp' | 'instagram' | 'facebook'
    content: string
    editableId: string
    status: 'loading' | 'ready'
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
}

export type AmplifyUIMessage = UIMessage<never, AmplifyDataParts>
