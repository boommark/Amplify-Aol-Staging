'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { UIMessage } from 'ai'
import { TextPart } from './parts/TextPart'
import { ResearchCard } from './parts/ResearchCard'
import { CopyBlock } from './parts/CopyBlock'
import { ImageCarousel } from './parts/ImageCarousel'
import { AdPreview } from './parts/AdPreview'
import { SkeletonPart } from './parts/SkeletonPart'
import { ActionChips } from './ActionChips'
import type { AmplifyDataParts } from '@/types/message'

interface MessageBubbleProps {
  message: UIMessage
  onChipSelect?: (prompt: string) => void
  onRegenerate?: () => void
}

function renderDataPart(
  part: { type: string; data: unknown },
  index: number,
  onChipSelect?: (prompt: string) => void
) {
  switch (part.type) {
    case 'data-research-card':
      return (
        <ResearchCard
          key={index}
          data={part.data as AmplifyDataParts['research-card']}
        />
      )
    case 'data-copy-block':
      return (
        <CopyBlock
          key={index}
          data={part.data as AmplifyDataParts['copy-block']}
        />
      )
    case 'data-image-carousel':
      return (
        <ImageCarousel
          key={index}
          data={part.data as AmplifyDataParts['image-carousel']}
        />
      )
    case 'data-ad-preview':
      return (
        <AdPreview
          key={index}
          data={part.data as AmplifyDataParts['ad-preview']}
        />
      )
    case 'data-action-chips': {
      const chips = (part.data as AmplifyDataParts['action-chips']).chips
      return (
        <ActionChips
          key={index}
          chips={chips}
          onSelect={onChipSelect ?? (() => {})}
        />
      )
    }
    default:
      return null
  }
}

function renderPart(
  part: UIMessage['parts'][number],
  index: number,
  onChipSelect?: (prompt: string) => void
) {
  if (part.type === 'text') {
    return <TextPart key={index} text={part.text} />
  }

  // Data parts — delegate to renderDataPart
  if (part.type.startsWith('data-')) {
    return renderDataPart(
      part as { type: string; data: unknown },
      index,
      onChipSelect
    )
  }

  // Unknown streaming part — show skeleton
  if (part.type === 'tool-invocation') {
    return <SkeletonPart key={index} type="card" />
  }

  return null
}

export function MessageBubble({ message, onChipSelect, onRegenerate: _onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // Extract plain text from parts (for user messages or fallback)
  const plainText = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="bg-[#3D8BE8] text-white rounded-[12px_12px_4px_12px] px-4 py-3 max-w-[75%] text-[15px]"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          {plainText}
        </div>
      </div>
    )
  }

  // AI message
  const hasParts = message.parts && message.parts.length > 0

  return (
    <div className="flex justify-start">
      <div
        className="bg-[#F3F4F6] text-slate-900 rounded-[12px_12px_12px_4px] px-4 py-3 max-w-[85%] text-[15px] space-y-3"
        style={{ fontFamily: 'Work Sans, sans-serif' }}
      >
        {hasParts ? (
          message.parts.map((part, index) =>
            renderPart(part, index, onChipSelect)
          )
        ) : (
          // Fallback: render plain text via react-markdown when parts is empty
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3D8BE8] underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {plainText}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
