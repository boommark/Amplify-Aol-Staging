'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: UIMessage[]
  isStreaming: boolean
  onEdit: (messageContent: string, messageIndex: number) => void
  onRegenerate: () => void
  onChipSelect?: (prompt: string) => void
}

export function MessageList({ messages, isStreaming, onEdit, onRegenerate, onChipSelect }: MessageListProps) {
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
      <div ref={bottomRef} />
    </div>
  )
}
