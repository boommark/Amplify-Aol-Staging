'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Pencil, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import type { UIMessage } from 'ai'
import { TextPart } from './parts/TextPart'
import { ResearchCard } from './parts/ResearchCard'
import { CopyBlock } from './parts/CopyBlock'
import { ImageCarousel } from './parts/ImageCarousel'
import { AdPreview } from './parts/AdPreview'
import { SkeletonPart } from './parts/SkeletonPart'
import { ActionChips } from './ActionChips'
import { QuoteCard } from './parts/QuoteCard'
import { StageProgressBar } from './StageProgressBar'
import type { AmplifyDataParts } from '@/types/message'

interface MessageBubbleProps {
  message: UIMessage
  messageIndex?: number
  isLastUserMessage?: boolean
  isLastAssistantMessage?: boolean
  isStreaming?: boolean
  onChipSelect?: (prompt: string) => void
  onRegenerate?: () => void
  onEdit?: (content: string) => void
  hasCreatives?: boolean
  selectedFlavor?: 'warm' | 'playful'
  pipelineStage?: string
  onTriggerAdCreativeGeneration?: (flavor: 'warm' | 'playful') => void
}

interface CreativeProps {
  hasCreatives?: boolean
  selectedFlavor?: 'warm' | 'playful'
  pipelineStage?: string
  onTriggerAdCreativeGeneration?: (flavor: 'warm' | 'playful') => void
}

function renderDataPart(
  part: { type: string; data: unknown },
  index: number,
  onChipSelect?: (prompt: string) => void,
  creativeProps?: CreativeProps
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
          hasCreatives={creativeProps?.hasCreatives}
          selectedFlavor={creativeProps?.selectedFlavor}
          pipelineStage={creativeProps?.pipelineStage}
          onTriggerAdCreativeGeneration={creativeProps?.onTriggerAdCreativeGeneration}
        />
      )
    }
    case 'data-quote-card':
      return (
        <QuoteCard
          key={index}
          data={part.data as AmplifyDataParts['quote-card']}
        />
      )
    case 'data-stage-progress':
      return (
        <StageProgressBar
          key={index}
          stages={(part.data as AmplifyDataParts['stage-progress']).stages}
        />
      )
    default:
      return null
  }
}

function renderPart(
  part: UIMessage['parts'][number],
  index: number,
  onChipSelect?: (prompt: string) => void,
  creativeProps?: CreativeProps
) {
  if (part.type === 'text') {
    return <TextPart key={index} text={part.text} />
  }

  // Data parts — delegate to renderDataPart
  if (part.type.startsWith('data-')) {
    return renderDataPart(
      part as { type: string; data: unknown },
      index,
      onChipSelect,
      creativeProps
    )
  }

  // Unknown streaming part — show skeleton
  if (part.type === 'tool-invocation') {
    return <SkeletonPart key={index} type="card" />
  }

  return null
}

export function MessageBubble({
  message,
  messageIndex: _messageIndex,
  isLastUserMessage,
  isLastAssistantMessage,
  isStreaming,
  onChipSelect,
  onRegenerate,
  onEdit,
  hasCreatives,
  selectedFlavor,
  pipelineStage,
  onTriggerAdCreativeGeneration,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // Extract plain text from parts (for user messages or fallback)
  const plainText = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')

  const createdAt = (message as UIMessage & { createdAt?: Date }).createdAt

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        <div className="flex justify-end">
          <div
            className="relative bg-[#3D8BE8] text-white rounded-[12px_12px_4px_12px] px-4 py-3 max-w-[75%] text-[15px] shadow-sm break-words"
            style={{ fontFamily: 'Work Sans, sans-serif', lineHeight: '1.5', overflowWrap: 'anywhere' }}
          >
            {/* Edit button — only on last user message */}
            {isLastUserMessage && onEdit && (
              <button
                onClick={() => onEdit(plainText)}
                className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
                aria-label="Edit message"
                title="Edit and resubmit"
              >
                <Pencil size={14} />
              </button>
            )}
            <span className={isLastUserMessage && onEdit ? 'pr-5' : ''}>{plainText}</span>
          </div>
        </div>
        {createdAt && (
          <span
            className="text-xs text-slate-400 mt-1 mr-1"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            {format(createdAt, 'h:mm a')}
          </span>
        )}
      </div>
    )
  }

  // AI message
  const hasParts = message.parts && message.parts.length > 0

  return (
    <div className="flex flex-col items-start">
      <div
        className="bg-[#F9FAFB] text-slate-900 rounded-[16px_16px_16px_4px] px-5 py-4 max-w-[85%] lg:max-w-[75%] text-[15px] space-y-3 border border-slate-100 break-words min-w-0"
        style={{ fontFamily: 'Work Sans, sans-serif', lineHeight: '1.6', overflowWrap: 'anywhere' }}
      >
        {hasParts ? (
          message.parts.map((part, index) =>
            renderPart(part, index, onChipSelect, { hasCreatives, selectedFlavor, pipelineStage, onTriggerAdCreativeGeneration })
          )
        ) : isStreaming ? (
          // Typing indicator during streaming
          <div className="flex gap-1 items-center py-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          // Fallback: render plain text via react-markdown when parts is empty
          <div className="prose prose-slate max-w-none" style={{ fontSize: '15px', lineHeight: '1.6' }}>
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
      {createdAt && (
        <span
          className="text-xs text-slate-400 mt-1 ml-1"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          {format(createdAt, 'h:mm a')}
        </span>
      )}
      {/* Regenerate button — only below the last AI message when not streaming */}
      {isLastAssistantMessage && !isStreaming && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 mt-1 ml-1 text-xs text-slate-400 hover:text-[#3D8BE8] transition-colors duration-200 cursor-pointer"
          aria-label="Regenerate response"
          title="Regenerate response"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          <RotateCcw size={13} />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  )
}
