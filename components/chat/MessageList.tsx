'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import { MessageBubble } from './MessageBubble'
import { SkeletonPart } from './parts/SkeletonPart'

interface MessageListProps {
  messages: UIMessage[]
  isStreaming: boolean
  isLoading?: boolean
  error?: Error | undefined
  onEdit: (messageContent: string, messageIndex: number) => void
  onRegenerate: () => void
  onRetry?: () => void
  onChipSelect?: (prompt: string) => void
}

export function MessageList({
  messages,
  isStreaming,
  isLoading,
  error,
  onEdit,
  onRegenerate,
  onRetry,
  onChipSelect,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[#3D8BE8]/10 flex items-center justify-center mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3D8BE8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold text-slate-900 mb-2"
          style={{ fontFamily: 'Raleway, sans-serif' }}
        >
          Start your campaign
        </h3>
        <p
          className="text-sm text-slate-500 max-w-xs"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          Describe your event or campaign and Amplify will help you create a complete marketing kit.
        </p>
      </div>
    )
  }

  // Find index of last user message for edit capability
  const lastUserMessageIndex = messages.reduce(
    (acc, msg, idx) => (msg.role === 'user' ? idx : acc),
    -1,
  )

  // Determine if we should show the loading skeleton:
  // isLoading is true AND the last message is from the user (no assistant response yet)
  const lastMessage = messages[messages.length - 1]
  const showLoadingSkeleton = isLoading && lastMessage?.role === 'user'

  return (
    <div className="flex flex-col gap-4 py-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLastUserMessage={message.role === 'user' && index === lastUserMessageIndex}
          isLastAssistantMessage={
            message.role === 'assistant' && index === messages.length - 1
          }
          isStreaming={isStreaming && index === messages.length - 1}
          onEdit={(content) => onEdit(content, index)}
          onRegenerate={onRegenerate}
          onChipSelect={onChipSelect}
          messageIndex={index}
        />
      ))}

      {/* Loading skeleton — appears immediately when user sends, before any tokens arrive */}
      {showLoadingSkeleton && (
        <div className="flex items-start gap-3 px-4">
          <div className="w-7 h-7 rounded-full bg-[#3D8BE8]/10 flex items-center justify-center shrink-0 mt-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3D8BE8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="bg-gray-100 rounded-[12px_12px_12px_4px] px-4 py-3 max-w-[85%] min-w-[200px]">
            <SkeletonPart type="text" />
          </div>
        </div>
      )}

      {/* Error banner with retry option */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4">
          <p className="text-red-700 text-sm mb-3">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="bg-white border border-red-300 text-red-600 rounded-full px-4 py-1.5 text-sm hover:bg-red-50 cursor-pointer transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
