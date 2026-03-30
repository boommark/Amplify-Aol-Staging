import { adminClient } from '@/lib/supabase/admin'

interface PromptEntry {
  template: string
  model_hint: string | null
}

interface CacheEntry {
  data: PromptEntry
  timestamp: number
}

// Simple Map-based LRU cache with max 50 entries and 5-minute TTL
const MAX_CACHE_SIZE = 50
const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map<string, CacheEntry>()

function evictOldest() {
  // Remove oldest entry when at capacity
  const firstKey = cache.keys().next().value
  if (firstKey !== undefined) {
    cache.delete(firstKey)
  }
}

/**
 * Load a prompt template from the Supabase `prompts` table by its dot-notation key
 * (e.g., 'chat.orchestrate'). Results are cached for 5 minutes with a max of 50 entries.
 *
 * Falls back to a sensible default if no matching prompt is found in the database.
 */
export async function loadPrompt(
  domainTask: string
): Promise<{ template: string; variables: string[]; model_hint: string | null }> {
  const now = Date.now()

  // Check cache first
  const cached = cache.get(domainTask)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return {
      template: cached.data.template,
      variables: extractVariables(cached.data.template),
      model_hint: cached.data.model_hint,
    }
  }

  // Fetch from Supabase — the prompts table uses a single `key` column
  const { data, error } = await adminClient
    .from('prompts')
    .select('template, model_override')
    .eq('key', domainTask)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // Return sensible fallback if no prompt found
    const fallbackTemplate =
      'You are Amplify, an AI marketing copilot for Art of Living. {{tone}}'
    return {
      template: fallbackTemplate,
      variables: extractVariables(fallbackTemplate),
      model_hint: null,
    }
  }

  const entry: PromptEntry = {
    template: data.template,
    model_hint: (data as { model_override?: string | null }).model_override ?? null,
  }

  // Store in cache, evict oldest if at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    evictOldest()
  }
  cache.set(domainTask, { data: entry, timestamp: now })

  return {
    template: entry.template,
    variables: extractVariables(entry.template),
    model_hint: entry.model_hint,
  }
}

/** Extract {{varName}} variable names from a template string */
function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) ?? []
  return matches.map((m) => m.slice(2, -2))
}
