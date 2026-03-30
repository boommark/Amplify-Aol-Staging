import { describe, it, expect } from 'vitest'
import { TASK_MODEL_MAP, getModelForTask } from '@/lib/ai/models'

describe('TASK_MODEL_MAP', () => {
  it('contains all expected task keys', () => {
    const expectedKeys = [
      'chat.orchestrate',
      'copy.premium',
      'copy.volume',
      'research.regional',
      'image.quote',
      'image.ad-creative',
      'video.ad',
    ]
    for (const key of expectedKeys) {
      expect(TASK_MODEL_MAP).toHaveProperty(key)
    }
  })

  it('each entry has a model and label', () => {
    for (const [, value] of Object.entries(TASK_MODEL_MAP)) {
      expect(value).toHaveProperty('model')
      expect(value).toHaveProperty('label')
      expect(typeof value.label).toBe('string')
    }
  })

  it('getModelForTask returns correct config for chat.orchestrate', () => {
    const config = getModelForTask('chat.orchestrate')
    expect(config.label).toBe('Claude Sonnet')
  })
})
