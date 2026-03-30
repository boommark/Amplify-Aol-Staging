import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the AI SDK streamText
vi.mock('ai', () => ({
  streamText: vi.fn(),
}))

// Mock the models module
vi.mock('@/lib/ai/models', () => ({
  TASK_MODEL_MAP: {
    'chat.orchestrate': {
      model: { provider: 'anthropic', modelId: 'claude-sonnet-4-5' },
      label: 'Claude Sonnet',
    },
  },
}))

// Mock the prompt registry
vi.mock('@/lib/prompts/registry', () => ({
  loadPrompt: vi.fn().mockResolvedValue({
    template: 'You are Amplify. Tone: {{tone}}',
    variables: ['tone'],
    model_hint: null,
  }),
}))

describe('Chat Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('selects correct model for chat.orchestrate task', async () => {
    const { streamText } = await import('ai')
    const { TASK_MODEL_MAP } = await import('@/lib/ai/models')

    const mockResult = { toUIMessageStreamResponse: vi.fn() }
    vi.mocked(streamText).mockReturnValue(mockResult as any)

    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    const messages = [{ role: 'user' as const, content: [{ type: 'text' as const, text: 'hello' }] }]
    await runStreamingTask('chat.orchestrate', { messages })

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: TASK_MODEL_MAP['chat.orchestrate'].model,
      }),
    )
  }) // CHAT-02, INFRA-02

  it('injects tone into system prompt', async () => {
    const { streamText } = await import('ai')

    const mockResult = { toUIMessageStreamResponse: vi.fn() }
    vi.mocked(streamText).mockReturnValue(mockResult as any)

    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    const messages = [{ role: 'user' as const, content: [{ type: 'text' as const, text: 'test' }] }]
    await runStreamingTask('chat.orchestrate', {
      messages,
      variables: { tone: 'formal' },
    })

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'You are Amplify. Tone: formal',
      }),
    )
  }) // CHAT-07

  it('applies 10-turn sliding window to messages', async () => {
    const { streamText } = await import('ai')

    const mockResult = { toUIMessageStreamResponse: vi.fn() }
    vi.mocked(streamText).mockReturnValue(mockResult as any)

    const { runStreamingTask } = await import('@/lib/ai/orchestrator')

    // Create 25 messages (more than maxTurns * 2 = 20)
    const messages = Array.from({ length: 25 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: [{ type: 'text' as const, text: `message ${i}` }],
    }))

    await runStreamingTask('chat.orchestrate', { messages, maxTurns: 10 })

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        // Only the last 20 messages (10 turns * 2) should be passed
        messages: messages.slice(-20),
      }),
    )
  }) // context management
})
