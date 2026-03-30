'use client'

import { useState, useCallback } from 'react'
import type { UIMessage } from 'ai'
import { ChatLayout } from '@/components/chat/ChatLayout'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { useAmplifyChat } from '@/hooks/useAmplifyChat'
import type { Tone } from '@/hooks/useAmplifyChat'

interface ChatInterfaceProps {
  campaignId: string
  initialMessages: UIMessage[]
  campaignTitle: string | null
}

export function ChatInterface({ campaignId, initialMessages, campaignTitle: _initialTitle }: ChatInterfaceProps) {
  const [editingContent, setEditingContent] = useState<string>('')

  const {
    messages,
    status,
    sendMessage,
    stop,
    regenerate,
    setMessages,
    tone,
    setTone,
  } = useAmplifyChat({
    campaignId,
    initialMessages,
    onTitleGenerated: (_title) => {
      // Title updated in DB — sidebar can be refreshed by parent if needed
    },
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text })
    },
    [sendMessage],
  )

  const handleEdit = useCallback(
    (content: string, messageIndex: number) => {
      // Truncate messages to before this user message and all following messages
      setMessages(messages.slice(0, messageIndex))
      setEditingContent(content)
    },
    [messages, setMessages],
  )

  const handleChipSelect = useCallback(
    (prompt: string) => {
      sendMessage({ text: prompt })
    },
    [sendMessage],
  )

  return (
    <div className="flex flex-col h-full">
      <ChatLayout
        messageArea={
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onEdit={handleEdit}
            onRegenerate={regenerate}
            onChipSelect={handleChipSelect}
          />
        }
        inputBar={
          <ChatInput
            isStreaming={isStreaming}
            tone={tone}
            onToneChange={(t: Tone) => setTone(t)}
            onSend={handleSend}
            onStop={stop}
            editingContent={editingContent}
            onEditingContentClear={() => setEditingContent('')}
          />
        }
      />
    </div>
  )
}
