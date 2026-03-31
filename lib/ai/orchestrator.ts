import { streamText, type UIMessage } from 'ai'
import type { ModelMessage } from 'ai'
import { TASK_MODEL_MAP, type TaskKey } from '@/lib/ai/models'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'

/**
 * Convert UIMessage[] (from useChat client) to ModelMessage[] (for streamText).
 * UIMessage has parts[], ModelMessage needs content string.
 */
function toModelMessages(messages: UIMessage[] | ModelMessage[]): ModelMessage[] {
  return messages.map((msg) => {
    // If it already has a string content, it's likely already a ModelMessage
    if (typeof (msg as ModelMessage).content === 'string') {
      return msg as ModelMessage
    }

    // UIMessage: extract text from parts
    const uiMsg = msg as UIMessage
    const textContent = uiMsg.parts
      ?.filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join('\n') || ''

    return {
      role: uiMsg.role as 'user' | 'assistant' | 'system',
      content: textContent,
    }
  })
}

interface RunStreamingTaskOptions {
  messages: UIMessage[] | ModelMessage[]
  variables?: Record<string, string>
  maxTurns?: number
  onFinish?: (result: { text: string }) => Promise<void>
}

/**
 * Run a streaming AI task by task key.
 *
 * Resolves the model from TASK_MODEL_MAP, loads and renders the prompt template
 * from Supabase (with caching), applies a sliding window to the message history,
 * and calls streamText. The caller receives the streamText result and is
 * responsible for converting it to a response (e.g., result.toDataStreamResponse()).
 */
export async function runStreamingTask(
  taskKey: TaskKey,
  options: RunStreamingTaskOptions
) {
  const { messages, variables = {}, maxTurns = 10, onFinish } = options

  // 1. Resolve model from TASK_MODEL_MAP
  const { model } = TASK_MODEL_MAP[taskKey]

  // 2. Load and render the system prompt
  const prompt = await loadPrompt(taskKey)
  const system = renderPrompt(prompt.template, variables)

  // 3. Convert UIMessage[] to ModelMessage[] and apply sliding window
  const modelMessages = toModelMessages(messages)
  const windowedMessages = modelMessages.slice(-(maxTurns * 2))

  // 4. Stream the response
  const result = streamText({
    model,
    system,
    messages: windowedMessages,
    ...(onFinish ? { onFinish } : {}),
  })

  return result
}
