'use client'

import { useState, useCallback, useMemo } from 'react'
import type { UIMessage } from 'ai'
import { ChatLayout } from '@/components/chat/ChatLayout'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { StageProgressBar } from '@/components/chat/StageProgressBar'
import { ChannelSelector } from '@/components/chat/ChannelSelector'
import { ResearchReusePrompt } from '@/components/chat/ResearchReusePrompt'
import { usePipelineChat } from '@/hooks/usePipelineChat'

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
    error,
    stop,
    regenerate,
    setMessages,
    pipeline,
    stages,
    sendPipelineMessage,
    triggerWisdom,
    triggerCopyGeneration,
    triggerCompetitorScan,
    reuseResearch,
    runFreshResearch,
    showChannelSelectorPanel,
    toggleChannel,
    addCustomChannel,
  } = usePipelineChat({
    campaignId,
    initialMessages,
    onTitleGenerated: (_title) => {
      // Title updated in DB — sidebar can be refreshed by parent if needed
    },
  })

  const isStreaming = status === 'streaming' || status === 'submitted' || pipeline.isGenerating
  const isLoading = status === 'submitted' || pipeline.isGenerating

  const handleSend = useCallback(
    (text: string) => {
      sendPipelineMessage(text)
    },
    [sendPipelineMessage],
  )

  const handleEdit = useCallback(
    (content: string, messageIndex: number) => {
      setMessages(messages.slice(0, messageIndex))
      setEditingContent(content)
    },
    [messages, setMessages],
  )

  /**
   * Route action chip clicks to the appropriate pipeline trigger.
   */
  const handleChipSelect = useCallback(
    (prompt: string) => {
      const normalized = prompt.trim().toLowerCase()
      if (normalized === 'continue to wisdom' || normalized === 'continue to wisdom stage') {
        triggerWisdom()
      } else if (normalized === 'scan competitor content for inspiration' || normalized === 'scan competitors') {
        triggerCompetitorScan()
      } else if (normalized === 'continue to copy') {
        showChannelSelectorPanel()
      } else if (normalized === 'different topic' || normalized === 'try different topic') {
        triggerWisdom()
      } else {
        // Generic: send as a pipeline message (covers "Add notes", refinements, etc.)
        sendPipelineMessage(prompt)
      }
    },
    [triggerWisdom, triggerCompetitorScan, showChannelSelectorPanel, sendPipelineMessage],
  )

  /**
   * Build synthetic pipeline messages from pipeline state.
   * These appear as assistant messages in the message list.
   * Research results appear progressively as each SSE event adds to researchResults.
   */
  const pipelineMessages: UIMessage[] = useMemo(() => {
    const msgs: UIMessage[] = []

    // URL parsing state — show what was extracted from the workshop URL
    if (pipeline.parsingUrl) {
      msgs.push({
        id: 'pipeline-url-parsing',
        role: 'assistant',
        parts: [{ type: 'text' as const, text: `Parsing workshop details from URL...` }],
      })
    } else if (pipeline.parsedWorkshop && !pipeline.researchResults.length) {
      const pw = pipeline.parsedWorkshop
      const details = [
        pw.title && `**${pw.title}**`,
        pw.eventType && `Type: ${pw.eventType}`,
        pw.date && `Date: ${pw.date}`,
        pw.location && `Location: ${pw.location}`,
        pw.region && `Region: ${pw.region}`,
        pw.price && `Price: ${pw.price}`,
        pw.description && `\n${pw.description}`,
      ].filter(Boolean).join('\n')

      const text = pipeline.stage === 'idle'
        ? `I found these details from the workshop URL:\n\n${details}\n\nPlease describe the location/region so I can start researching your audience.`
        : `Workshop details extracted:\n\n${details}\n\nStarting research...`

      msgs.push({
        id: 'pipeline-url-parsed',
        role: 'assistant',
        parts: [{ type: 'text' as const, text }],
      })
    }

    // Research results (progressive — rendered one card at a time as each arrives)
    if (pipeline.researchResults.length > 0) {
      const parts: UIMessage['parts'] = pipeline.researchResults.map((result) => ({
        type: 'data-research-card' as const,
        data: {
          topic: result.dimension,
          findings: result.findings,
          status: 'ready' as const,
        },
      }))

      // Add action chips when all research has completed
      if (pipeline.hasResearch) {
        parts.push({
          type: 'data-action-chips' as const,
          data: {
            chips: [
              { label: 'Add notes', prompt: 'Add notes' },
              { label: 'Scan competitors', prompt: 'Scan competitor content for inspiration' },
              { label: 'Continue to Wisdom', prompt: 'Continue to wisdom' },
            ],
          },
        })
      }

      msgs.push({
        id: 'pipeline-research',
        role: 'assistant',
        parts,
      })
    }

    // Wisdom quotes (with image URLs already populated from server)
    if (pipeline.wisdomQuotes.length > 0) {
      const parts: UIMessage['parts'] = pipeline.wisdomQuotes.map((quote) => ({
        type: 'data-quote-card' as const,
        data: quote,
      }))

      // Add action chips after wisdom
      parts.push({
        type: 'data-action-chips' as const,
        data: {
          chips: [
            { label: 'Different topic', prompt: 'Different topic' },
            { label: 'Continue to Copy', prompt: 'Continue to copy' },
          ],
        },
      })

      msgs.push({
        id: 'pipeline-wisdom',
        role: 'assistant',
        parts,
      })
    }

    // Copy results — one copy-block per channel
    if (pipeline.copyResults.length > 0) {
      const parts: UIMessage['parts'] = pipeline.copyResults.map((copy) => ({
        type: 'data-copy-block' as const,
        data: {
          channel: copy.channel,
          content: copy.content,
          editableId: copy.assetId,
          status: 'ready' as const,
        },
      }))

      msgs.push({
        id: 'pipeline-copy',
        role: 'assistant',
        parts,
      })
    }

    return msgs
  }, [pipeline.parsingUrl, pipeline.parsedWorkshop, pipeline.stage, pipeline.researchResults, pipeline.hasResearch, pipeline.wisdomQuotes, pipeline.copyResults])

  // Combine real chat messages + pipeline synthetic messages
  const allMessages = useMemo(
    () => [...messages, ...pipelineMessages],
    [messages, pipelineMessages],
  )

  const showProgressBar = pipeline.stage !== 'idle' || pipeline.parsingUrl !== null

  return (
    <div className="flex flex-col h-full">
      {/* Stage progress bar — visible once pipeline is active */}
      {showProgressBar && (
        <div className="px-4 pt-2 pb-0 border-b border-slate-100 bg-white">
          <StageProgressBar stages={stages} />
        </div>
      )}

      <ChatLayout
        messageArea={
          <div className="flex flex-col gap-4">
            {/* Research reuse prompt — appears before queries fire */}
            {pipeline.reusableResearch && (
              <div className="px-4 pt-4">
                <ResearchReusePrompt
                  campaignName={pipeline.reusableResearch.campaignTitle}
                  onReuse={reuseResearch}
                  onFresh={runFreshResearch}
                />
              </div>
            )}

            {/* Channel selector — appears after "Continue to copy" chip */}
            {pipeline.showChannelSelector && !pipeline.hasCopy && (
              <div className="px-4 pt-2">
                <ChannelSelector
                  selectedChannels={pipeline.selectedChannels}
                  onToggle={toggleChannel}
                  onAddCustom={addCustomChannel}
                  onGenerate={triggerCopyGeneration}
                  isGenerating={pipeline.isGenerating}
                />
              </div>
            )}

            <MessageList
              messages={allMessages}
              isStreaming={isStreaming}
              isLoading={isLoading}
              error={error}
              onEdit={handleEdit}
              onRegenerate={regenerate}
              onRetry={regenerate}
              onChipSelect={handleChipSelect}
            />
          </div>
        }
        inputBar={
          <ChatInput
            isStreaming={isStreaming}
            onSend={handleSend}
            onStop={stop}
            editingContent={editingContent}
            onEditingContentClear={() => setEditingContent('')}
            error={error}
          />
        }
      />
    </div>
  )
}
