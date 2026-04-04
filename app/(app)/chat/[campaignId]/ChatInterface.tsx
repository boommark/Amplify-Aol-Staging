'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
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

  // Ref to avoid stale closure in handleChipSelect
  const parsedWorkshopRef = useRef(pipeline.parsedWorkshop)
  parsedWorkshopRef.current = pipeline.parsedWorkshop

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

      // --- URL parse stage ---
      if (normalized === 'start research') {
        const pw = parsedWorkshopRef.current
        sendPipelineMessage(
          `Start research for ${pw?.eventType || 'workshop'} in ${pw?.region || 'my area'}`,
          'research',
          {
            region: pw?.region || '',
            eventType: pw?.eventType || '',
            eventDate: pw?.date || '',
          }
        )
        return
      }

      // --- Post-research stage ---
      if (normalized === 'continue to wisdom' || normalized === 'continue to wisdom stage') {
        sendPipelineMessage('Continue to wisdom', 'wisdom')
        return
      }
      if (normalized.includes('scan competitor')) {
        sendPipelineMessage('Scan competitor content for inspiration', 'competitor_scan')
        return
      }
      if (normalized === 'add notes' || normalized === 'add a note') {
        // Focus the input with a prompt — don't send a message
        setEditingContent('Also, ')
        return
      }

      // --- Post-wisdom stage ---
      if (normalized === 'continue to copy') {
        showChannelSelectorPanel()
        return
      }
      if (normalized === 'different topic' || normalized === 'try different topic') {
        sendPipelineMessage('Different topic', 'wisdom')
        return
      }

      // Generic: send as pipeline message with AI classification
      sendPipelineMessage(prompt)
    },
    [showChannelSelectorPanel, sendPipelineMessage, setEditingContent],
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
    } else if (pipeline.parsedWorkshop) {
      const pw = pipeline.parsedWorkshop
      const details = [
        pw.title && `**${pw.title}**`,
        pw.eventType && `**Type:** ${pw.eventType}`,
        pw.teacher && `**Teacher:** ${pw.teacher}`,
        pw.date && `**Date:** ${pw.date}`,
        pw.timing && `**Timing:** ${pw.timing}`,
        pw.location && `**Location:** ${pw.location}`,
        pw.isOnline && `**Mode:** Online`,
        pw.region && `**Region:** ${pw.region}`,
        pw.centerName && `**Center:** ${pw.centerName}`,
        pw.price && `**Price:** ${pw.price}`,
        pw.contactName && `**Contact:** ${pw.contactName}${pw.contactEmail ? ` (${pw.contactEmail})` : ''}`,
        pw.description && `\n${pw.description}`,
      ].filter(Boolean).join('  \n')

      const text = `Here are the workshop details:\n\n${details}`

      const parts: UIMessage['parts'] = [{ type: 'text' as const, text }]

      // Show action chips only before research has started (or reuse prompt shown)
      if (!pipeline.researchResults.length && !pipeline.isGenerating && !pipeline.reusableResearch && pipeline.stage === 'idle') {
        parts.push({
          type: 'data-action-chips' as const,
          data: {
            chips: [
              { label: 'Start Research', prompt: 'Start Research' },
              { label: 'Edit Details', prompt: 'Edit Details' },
            ],
          },
        })
      }

      msgs.push({
        id: 'pipeline-url-parsed',
        role: 'assistant',
        parts,
      })
    }

    // Research results (progressive — rendered one card at a time as each arrives)
    if (pipeline.researchResults.length > 0) {
      const parts: UIMessage['parts'] = pipeline.researchResults.map((result) => ({
        type: 'data-research-card' as const,
        data: {
          topic: result.dimension,
          summary: result.findings[0]?.value?.slice(0, 150) || '',
          findings: result.findings,
          status: 'ready' as const,
        },
      }))

      // Add action chips when all research has completed
      if (pipeline.hasResearch && !pipeline.hasWisdom) {
        // Add a contextual assistant text before the chips
        parts.push({
          type: 'text' as const,
          text: 'Research complete. You can add any local context I should know, or continue to the next step.',
        })
        parts.push({
          type: 'data-action-chips' as const,
          data: {
            chips: [
              { label: 'Continue to Wisdom', prompt: 'Continue to wisdom' },
              { label: 'Add a note', prompt: 'Add a note' },
              { label: 'Scan competitors', prompt: 'Scan competitors' },
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

    // Wisdom timeout/error — show message with option to continue to copy
    if (pipeline.stage === 'wisdom' && !pipeline.hasWisdom && pipeline.wisdomQuotes.length === 0 && !pipeline.isGenerating) {
      msgs.push({
        id: 'pipeline-wisdom-timeout',
        role: 'assistant',
        parts: [
          { type: 'text' as const, text: 'Wisdom quotes are unavailable right now. You can continue to copy generation using the research context.' },
          {
            type: 'data-action-chips' as const,
            data: {
              chips: [
                { label: 'Continue to Copy', prompt: 'Continue to copy' },
              ],
            },
          },
        ],
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
  }, [pipeline.parsingUrl, pipeline.parsedWorkshop, pipeline.stage, pipeline.researchResults, pipeline.hasResearch, pipeline.isGenerating, pipeline.reusableResearch, pipeline.hasWisdom, pipeline.wisdomQuotes, pipeline.copyResults, pipeline.showChannelSelector])

  // Insert pipeline messages in correct conversational order.
  // Pipeline messages have stable IDs: 'pipeline-url-parsed', 'pipeline-research', etc.
  // We match each to the user message that triggered it, then interleave.
  const allMessages = useMemo(
    () => {
      if (pipelineMessages.length === 0) return messages
      if (messages.length === 0) return pipelineMessages

      const result: UIMessage[] = []
      // Index pipeline messages by their trigger type
      const urlParsed = pipelineMessages.find(m => m.id === 'pipeline-url-parsing' || m.id === 'pipeline-url-parsed')
      const research = pipelineMessages.find(m => m.id === 'pipeline-research')
      const wisdom = pipelineMessages.find(m => m.id === 'pipeline-wisdom')
      const copy = pipelineMessages.find(m => m.id === 'pipeline-copy')

      // Track which pipeline messages have been inserted (each only once)
      const inserted = new Set<string>()

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        result.push(msg)

        // After a user message, insert the pipeline response it triggered (once only)
        if (msg.role === 'user') {
          const text = msg.parts
            ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map(p => p.text).join('') || ''

          if (text.match(/https?:\/\//) && urlParsed && !inserted.has('urlParsed')) {
            result.push(urlParsed)
            inserted.add('urlParsed')
          } else if (text.toLowerCase().includes('research for') && research && !inserted.has('research')) {
            result.push(research)
            inserted.add('research')
          } else if (text.toLowerCase().includes('continue to wisdom') && wisdom && !inserted.has('wisdom')) {
            result.push(wisdom)
            inserted.add('wisdom')
          } else if (text.toLowerCase().includes('generate copy') && copy && !inserted.has('copy')) {
            result.push(copy)
            inserted.add('copy')
          }
        }
      }

      // Append any pipeline messages that weren't matched
      for (const pm of pipelineMessages) {
        if (!result.includes(pm)) {
          result.push(pm)
        }
      }

      return result
    },
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
