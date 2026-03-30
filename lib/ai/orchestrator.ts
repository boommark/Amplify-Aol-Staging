import { streamText } from 'ai'
import type { ModelMessage } from 'ai'
import { TASK_MODEL_MAP, type TaskKey } from '@/lib/ai/models'
import { loadPrompt } from '@/lib/prompts/registry'
import { renderPrompt } from '@/lib/prompts/renderer'

interface RunStreamingTaskOptions {
  messages: ModelMessage[]
  variables?: Record<string, string>
  /**
   * Maximum number of user+assistant message pairs to include in the context
   * window. Older messages are dropped first (sliding window). Defaults to 10.
   */
  maxTurns?: number
  /**
   * Called after the full stream completes with the assembled text.
   * Use this to persist the assistant message to the database.
   */
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

  // 3. Apply sliding window — keep only the last maxTurns message pairs.
  // A pair = 1 user + 1 assistant message, so we take the last maxTurns * 2 messages.
  const windowedMessages = messages.slice(-(maxTurns * 2))

  // 4. Stream the response
  const result = streamText({
    model,
    system,
    messages: windowedMessages,
    ...(onFinish ? { onFinish } : {}),
  })

  return result
}
