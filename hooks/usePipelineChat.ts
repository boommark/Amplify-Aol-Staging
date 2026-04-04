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
  teacher?: string
  teacherEmail?: string
  teacherPhone?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  timing?: string
  isOnline?: boolean
  centerName?: string
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
  channelQuantities: Record<string, number>
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
    channelQuantities: { Email: 1, WhatsApp: 1, Instagram: 1, Facebook: 1, Flyer: 1 },
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
          // URL parsed — store extracted workshop data, stay at idle so user can review and confirm
          setPipeline((prev) => ({
            ...prev,
            stage: 'idle',
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
        case 'research_dimension': {
          const newDimension = (data.data as { dimension: string }).dimension
          setPipeline((prev) => {
            // Deduplicate: skip if this dimension already exists
            if (prev.researchResults.some((r) => r.dimension === newDimension)) {
              return prev
            }
            return {
              ...prev,
              stage: 'research',
              researchResults: [
                ...prev.researchResults,
                {
                  dimension: newDimension,
                  findings: (
                    data.data as {
                      findings: Array<{ label: string; value: string; source?: string }>
                    }
                  ).findings,
                },
              ],
            }
          })
          break
        }

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

        case 'error':
          console.error('Pipeline error:', (data.data as { message: string }).message)
          setPipeline((prev) => ({ ...prev, isGenerating: false }))
          break

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
    async (text: string, pipelineAction?: string, pipelineData?: Record<string, unknown>, options?: { silent?: boolean }) => {
      // Optimistically add the user message so it appears in the chat immediately.
      // Silent mode skips this (used by "Run Fresh" which reuses the prior user message).
      if (!options?.silent) {
        const userMessage: UIMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          parts: [{ type: 'text', text }],
        }
        chat.setMessages([...chat.messages, userMessage])
      }

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
    // Expand channels by quantity: { Email: 2, WhatsApp: 1 } → ['email', 'email', 'whatsapp']
    const expandedChannels: string[] = []
    for (const ch of pipeline.selectedChannels) {
      const qty = pipeline.channelQuantities[ch] ?? 1
      for (let i = 0; i < qty; i++) {
        expandedChannels.push(ch.toLowerCase())
      }
    }
    const pw = pipeline.parsedWorkshop
    sendPipelineMessage('Generate copy', 'copy_generate', {
      channels: expandedChannels,
      workshopDetails: pw ? {
        contactName: pw.contactName,
        contactEmail: pw.contactEmail,
        contactPhone: pw.contactPhone,
        teacher: pw.teacher,
        price: pw.price,
        timing: pw.timing,
        centerName: pw.centerName,
        registrationUrl: pw.source,
      } : undefined,
    })
  }, [sendPipelineMessage, pipeline.selectedChannels, pipeline.channelQuantities, pipeline.parsedWorkshop])

  const triggerCompetitorScan = useCallback(() => {
    sendPipelineMessage('Scan competitor content for inspiration', 'competitor_scan')
  }, [sendPipelineMessage])

  const reuseResearch = useCallback(() => {
    sendPipelineMessage('Use existing research', 'research', {
      reuseFromCampaignId: pipeline.reusableResearch?.campaignId,
    })
    setPipeline((prev) => ({ ...prev, reusableResearch: null }))
  }, [sendPipelineMessage, pipeline.reusableResearch])

  // Ref so runFreshResearch always sees current parsedWorkshop
  const parsedWorkshopRef = useRef(pipeline.parsedWorkshop)
  parsedWorkshopRef.current = pipeline.parsedWorkshop

  const runFreshResearch = useCallback(() => {
    setPipeline((prev) => ({ ...prev, reusableResearch: null }))
    // Auto-trigger research silently (no duplicate user bubble)
    const pw = parsedWorkshopRef.current
    sendPipelineMessage(
      `Start research for ${pw?.eventType || 'workshop'} in ${pw?.region || 'my area'}`,
      'research',
      {
        region: pw?.region || '',
        eventType: pw?.eventType || '',
        eventDate: pw?.date || '',
        skipReuse: true,
      },
      { silent: true }
    )
  }, [sendPipelineMessage])

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
      channelQuantities: { ...prev.channelQuantities, [name]: 1 },
    }))
  }, [])

  const setChannelQuantity = useCallback((channel: string, quantity: number) => {
    setPipeline((prev) => ({
      ...prev,
      channelQuantities: { ...prev.channelQuantities, [channel]: quantity },
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
      state: (pipeline.hasWisdom || pipeline.stage === 'copy' || pipeline.hasCopy
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
        : pipeline.stage === 'copy' || pipeline.showChannelSelector
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
    setChannelQuantity,
    refineCopy,
  }
}
