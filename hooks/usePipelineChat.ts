'use client'
import { useState, useCallback, useRef } from 'react'
import { useAmplifyChat } from '@/hooks/useAmplifyChat'
import type { UIMessage } from 'ai'
import type { AmplifyDataParts } from '@/types/message'

export type PipelineStage = 'idle' | 'url_parsing' | 'research' | 'wisdom' | 'copy'

interface ParsedWorkshop {
  title?: string
  date?: string
  location?: string
  region?: string
  eventType?: string
  description?: string
  price?: string
  source: string
}

interface PipelineState {
  stage: PipelineStage
  hasResearch: boolean
  hasWisdom: boolean
  hasCopy: boolean
  researchResults: Array<{
    dimension: string
    findings: Array<{ label: string; value: string; source?: string }>
  }>
  wisdomQuotes: Array<AmplifyDataParts['quote-card']>
  copyResults: Array<{ channel: string; content: string; assetId: string }>
  selectedChannels: string[]
  isGenerating: boolean
  reusableResearch: { campaignId: string; campaignTitle: string } | null
  showChannelSelector: boolean
  parsedWorkshop: ParsedWorkshop | null
  parsingUrl: string | null
}

export function usePipelineChat({
  campaignId,
  initialMessages,
  onTitleGenerated,
}: {
  campaignId: string
  initialMessages: UIMessage[]
  onTitleGenerated?: (title: string) => void
}) {
  const chat = useAmplifyChat({ campaignId, initialMessages, onTitleGenerated })

  const [pipeline, setPipeline] = useState<PipelineState>({
    stage: 'idle',
    hasResearch: false,
    hasWisdom: false,
    hasCopy: false,
    researchResults: [],
    wisdomQuotes: [],
    copyResults: [],
    selectedChannels: ['Email', 'WhatsApp', 'Instagram', 'Facebook', 'Flyer'],
    isGenerating: false,
    reusableResearch: null,
    showChannelSelector: false,
    parsedWorkshop: null,
    parsingUrl: null,
  })

  // Keep a stable ref to avoid stale closures in sendPipelineMessage
  const sendMessageRef = useRef(chat.sendMessage)
  sendMessageRef.current = chat.sendMessage

  /**
   * Handle a pipeline response event from the server.
   * Called for each SSE event (research) or once for JSON responses (wisdom, copy).
   */
  const handlePipelineResponse = useCallback(
    (data: { action: string; data: Record<string, unknown> }) => {
      switch (data.action) {
        case 'url_parsing':
          // URL parsing has started — show parsing indicator
          setPipeline((prev) => ({
            ...prev,
            stage: 'url_parsing',
            parsingUrl: (data.data as { url: string }).url,
          }))
          break

        case 'url_parsed':
          // URL parsed — store extracted workshop data, transition to research stage
          setPipeline((prev) => ({
            ...prev,
            stage: 'research',
            parsedWorkshop: (data.data as { parsed: ParsedWorkshop }).parsed,
            parsingUrl: null,
          }))
          break

        case 'url_parse_complete':
          // Parse complete but no region — stay at idle so user can provide more info
          setPipeline((prev) => ({
            ...prev,
            stage: 'idle',
            parsedWorkshop: (data.data as { parsed: ParsedWorkshop }).parsed,
            parsingUrl: null,
          }))
          break

        case 'research_reuse_prompt':
          setPipeline((prev) => ({
            ...prev,
            stage: 'research',
            reusableResearch: {
              campaignId: (data.data as { reusableCampaignId: string }).reusableCampaignId,
              campaignTitle: (data.data as { reusableCampaignTitle: string }).reusableCampaignTitle,
            },
          }))
          break

        // Progressive: each dimension arrives as its own SSE event
        case 'research_dimension':
          setPipeline((prev) => ({
            ...prev,
            stage: 'research',
            researchResults: [
              ...prev.researchResults,
              {
                dimension: (data.data as { dimension: string }).dimension,
                findings: (
                  data.data as {
                    findings: Array<{ label: string; value: string; source?: string }>
                  }
                ).findings,
              },
            ],
          }))
          break

        case 'research_complete':
          // All dimensions have arrived; mark research as complete
          setPipeline((prev) => ({
            ...prev,
            stage: 'research',
            hasResearch: true,
          }))
          break

        case 'note_added':
          // Note added — no stage change needed
          break

        case 'competitor_complete':
          // Add competitor findings as a special research result
          setPipeline((prev) => ({
            ...prev,
            researchResults: [
              ...prev.researchResults,
              {
                dimension: 'Competitor Insights',
                findings: (
                  data.data as {
                    findings: Array<{ label: string; value: string; source?: string }>
                  }
                ).findings,
              },
            ],
          }))
          break

        case 'wisdom_complete':
          setPipeline((prev) => ({
            ...prev,
            stage: 'wisdom',
            hasWisdom: true,
            wisdomQuotes: (
              (data.data as { quotes: Array<Record<string, unknown>> }).quotes || []
            ).map((q, i) => ({
              quoteId: (q.quoteId as string) || `wisdom-${i}`,
              short: (q.short as string) || '',
              medium: (q.medium as string) || '',
              long: (q.long as string) || '',
              source: (q.source as string) || '',
              category: (q.category as string) || '',
              date: q.date as string | undefined,
              location: q.location as string | undefined,
              event: q.event as string | undefined,
              imageUrl: q.imageUrl as string | undefined, // Populated by generateQuoteImages on server
              isManual: (q.isManual as boolean) || false,
              status: 'ready' as const,
            })),
          }))
          break

        case 'wisdom_timeout':
          setPipeline((prev) => ({
            ...prev,
            stage: 'wisdom',
            hasWisdom: false, // No quotes but stage progressed
          }))
          break

        case 'crisis_flag':
          // Crisis detected — render handled in ChatInterface as special message
          setPipeline((prev) => ({ ...prev, stage: 'wisdom' }))
          break

        case 'copy_complete':
          setPipeline((prev) => ({
            ...prev,
            stage: 'copy',
            hasCopy: true,
            showChannelSelector: false,
            copyResults: (data.data as { copies: PipelineState['copyResults'] }).copies,
          }))
          break

        case 'copy_refined': {
          const refined = (
            data.data as { copy: { channel: string; content: string; assetId: string } }
          ).copy
          setPipeline((prev) => ({
            ...prev,
            copyResults: prev.copyResults.map((c) =>
              c.channel === refined.channel ? refined : c
            ),
          }))
          break
        }

        default:
          break
      }
    },
    []
  )

  /**
   * Enhanced send that intercepts pipeline responses.
   * Handles both SSE streams (research) and JSON responses (wisdom, copy).
   *
   * The user's message is added to local state immediately so it appears in
   * the chat UI regardless of which response path is taken.
   */
  const sendPipelineMessage = useCallback(
    async (text: string, pipelineAction?: string, pipelineData?: Record<string, unknown>) => {
      // Optimistically add the user message so it appears in the chat immediately.
      // This is needed because pipeline messages bypass the AI SDK useChat transport
      // and therefore never go through useChat's own message accumulation.
      const userMessage: UIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', text }],
        content: text,
      }
      chat.setMessages([...chat.messages, userMessage])

      setPipeline((prev) => ({ ...prev, isGenerating: true }))

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...chat.messages,
              { role: 'user', parts: [{ type: 'text', text }] },
            ],
            campaignId,
            pipelineAction,
            pipelineData,
          }),
        })

        // Non-2xx responses are errors — log and bail out. Do NOT fall through
        // to sendMessageRef which would cause a duplicate request and state corruption.
        if (!response.ok) {
          console.error('Pipeline fetch failed:', response.status, response.statusText)
          return
        }

        const contentType = response.headers.get('content-type')

        // Handle SSE streaming (research progressive results, url_parse flow)
        // Stage is set by individual events — do NOT pre-set stage here.
        if (contentType?.includes('text/event-stream') && response.body) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n\n')
            buffer = lines.pop() || '' // Keep incomplete chunk

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.pipelineResponse) {
                    handlePipelineResponse(data)
                  }
                } catch {
                  /* skip malformed events */
                }
              }
            }
          }
          return
        }

        // Handle JSON pipeline responses (wisdom, copy, reuse prompt, etc.)
        if (contentType?.includes('application/json')) {
          const data = await response.json()
          if (data.pipelineResponse) {
            handlePipelineResponse(data)
            return
          }
        }

        // The server returned a non-pipeline response (e.g. plain streaming text).
        // This should not happen in the current architecture — log and do nothing.
        // Do NOT call sendMessageRef here: the fetch already consumed the body and
        // a second call would create a duplicate request that corrupts chat state.
        console.warn('Pipeline fetch returned unexpected content-type:', contentType)
      } catch (error) {
        console.error('Pipeline message error:', error)
      } finally {
        setPipeline((prev) => ({ ...prev, isGenerating: false }))
      }
    },
    [chat.messages, chat.setMessages, campaignId, handlePipelineResponse]
  )

  // --- Stage transition helpers ---

  const triggerResearch = useCallback(
    (text: string) => {
      sendPipelineMessage(text)
    },
    [sendPipelineMessage]
  )

  const triggerWisdom = useCallback(() => {
    sendPipelineMessage('Continue to wisdom', 'wisdom')
  }, [sendPipelineMessage])

  const triggerCopyGeneration = useCallback(() => {
    sendPipelineMessage('Generate copy', 'copy_generate', {
      channels: pipeline.selectedChannels.map((c) => c.toLowerCase()),
    })
  }, [sendPipelineMessage, pipeline.selectedChannels])

  const triggerCompetitorScan = useCallback(() => {
    sendPipelineMessage('Scan competitor content for inspiration', 'competitor_scan')
  }, [sendPipelineMessage])

  const reuseResearch = useCallback(() => {
    sendPipelineMessage('Use existing research', 'research', {
      reuseFromCampaignId: pipeline.reusableResearch?.campaignId,
    })
    setPipeline((prev) => ({ ...prev, reusableResearch: null }))
  }, [sendPipelineMessage, pipeline.reusableResearch])

  const runFreshResearch = useCallback(() => {
    // Clear the reuse prompt — user will describe the workshop fresh
    setPipeline((prev) => ({ ...prev, reusableResearch: null }))
  }, [])

  const showChannelSelectorPanel = useCallback(() => {
    setPipeline((prev) => ({ ...prev, showChannelSelector: true }))
  }, [])

  const toggleChannel = useCallback((channel: string) => {
    setPipeline((prev) => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(channel)
        ? prev.selectedChannels.filter((c) => c !== channel)
        : [...prev.selectedChannels, channel],
    }))
  }, [])

  const addCustomChannel = useCallback((name: string) => {
    setPipeline((prev) => ({
      ...prev,
      selectedChannels: [...prev.selectedChannels, name],
    }))
  }, [])

  const refineCopy = useCallback(
    (channel: string, instruction: string) => {
      sendPipelineMessage(instruction, 'copy_refine', { channel, instruction })
    },
    [sendPipelineMessage]
  )

  // Computed stages array for StageProgressBar
  const stages = [
    {
      id: 'research' as const,
      label: 'Research',
      state: (pipeline.hasResearch
        ? 'completed'
        : pipeline.stage === 'research'
          ? 'active'
          : 'pending') as 'pending' | 'active' | 'completed',
    },
    {
      id: 'wisdom' as const,
      label: 'Wisdom',
      state: (pipeline.hasWisdom
        ? 'completed'
        : pipeline.stage === 'wisdom'
          ? 'active'
          : 'pending') as 'pending' | 'active' | 'completed',
    },
    {
      id: 'copy' as const,
      label: 'Copy',
      state: (pipeline.hasCopy
        ? 'completed'
        : pipeline.stage === 'copy'
          ? 'active'
          : 'pending') as 'pending' | 'active' | 'completed',
    },
  ]

  return {
    ...chat,
    pipeline,
    stages,
    sendPipelineMessage,
    triggerResearch,
    triggerWisdom,
    triggerCopyGeneration,
    triggerCompetitorScan,
    reuseResearch,
    runFreshResearch,
    showChannelSelectorPanel,
    toggleChannel,
    addCustomChannel,
    refineCopy,
  }
}
