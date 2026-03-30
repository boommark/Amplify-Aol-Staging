'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useMemo } from 'react'
import type { UIMessage } from 'ai'

export type Tone = 'formal' | 'casual' | 'inspiring'

interface UseAmplifyChatOptions {
  campaignId: string
  initialMessages?: UIMessage[]
  onTitleGenerated?: (title: string) => void
}

export function useAmplifyChat({
  campaignId,
  initialMessages = [],
  onTitleGenerated,
}: UseAmplifyChatOptions) {
  const [tone, setTone] = useState<Tone>('inspiring')
  const titleGenerated = useRef(false)
  const toneRef = useRef(tone)
  toneRef.current = tone

  // DefaultChatTransport with dynamic body so tone changes are picked up per request
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ campaignId, tone: toneRef.current }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaignId],
  )

  const chat = useChat({
    transport,
    messages: initialMessages,
    onFinish: async ({ messages: allMessages }) => {
      // Auto-generate title after first AI response (only once, only for new campaigns)
      if (!titleGenerated.current && initialMessages.length === 0) {
        titleGenerated.current = true
        try {
          const firstUserMsg = allMessages.find((m: UIMessage) => m.role === 'user')
          const firstUserMessage = firstUserMsg?.parts
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('')
          if (!firstUserMessage) return
          const res = await fetch('/api/campaigns/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId, firstMessage: firstUserMessage }),
          })
          if (res.ok) {
            const { title } = await res.json()
            onTitleGenerated?.(title)
          }
        } catch {
          // title generation is non-critical — ignore errors
        }
      }
    },
  })

  return {
    ...chat,
    tone,
    setTone,
  }
}
