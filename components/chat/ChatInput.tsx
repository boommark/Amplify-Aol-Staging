'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SendHorizontal, Square, Mic, Paperclip } from 'lucide-react'
import { useVoiceDictation } from '@/hooks/useVoiceDictation'

interface ChatInputProps {
  isStreaming: boolean
  onSend: (text: string) => void
  onStop: () => void
  editingContent?: string
  onEditingContentClear?: () => void
  error?: Error | undefined
}

export function ChatInput({
  isStreaming,
  onSend,
  onStop,
  editingContent,
  onEditingContentClear,
  error,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea between 48px and 120px
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 48), 120)}px`
  }, [])

  // When editingContent changes, populate the textarea and focus
  useEffect(() => {
    if (editingContent !== undefined && editingContent !== '') {
      setInput(editingContent)
      setTimeout(() => {
        textareaRef.current?.focus()
        adjustHeight()
      }, 0)
    }
  }, [editingContent, adjustHeight])

  // Adjust height as input changes
  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  const voice = useVoiceDictation((transcript) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
  })

  // Send is disabled when streaming or when there's an error and user hasn't typed anything new
  const hasNewInput = input.trim().length > 0
  const isSendDisabled = !hasNewInput || isStreaming

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    onEditingContentClear?.()
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'
    }
    onSend(trimmed)
  }, [input, isStreaming, onSend, onEditingContentClear])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3">
      {error && (
        <p className="text-red-500 text-xs mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Message failed to send. Type a new message to retry.
        </p>
      )}
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your campaign..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D8BE8]/30 focus:border-[#3D8BE8] transition-colors duration-200"
          style={{
            fontFamily: 'Work Sans, sans-serif',
            minHeight: '48px',
            maxHeight: '120px',
            lineHeight: '1.5',
          }}
          disabled={false}
        />

        {/* Right action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mic button */}
          {voice.isSupported && (
            <button
              type="button"
              onClick={voice.isListening ? voice.stop : voice.start}
              className={[
                'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
                voice.isListening
                  ? 'text-red-500 ring-2 ring-red-400 animate-pulse bg-red-50'
                  : 'text-slate-400 hover:text-[#3D8BE8] hover:bg-slate-50',
              ].join(' ')}
              aria-label={voice.isListening ? 'Stop listening' : 'Start voice dictation'}
              title={voice.isListening ? 'Stop listening' : 'Voice dictation'}
            >
              <Mic size={18} />
            </button>
          )}

          {/* Attach button (visual only — file upload in Phase 3+) */}
          <button
            type="button"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-[#3D8BE8] hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
            aria-label="Attach file"
            title="Attach file (coming soon)"
          >
            <Paperclip size={18} />
          </button>

          {/* Send / Stop button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full w-9 h-9 transition-colors duration-200 cursor-pointer"
              aria-label="Stop generation"
              title="Stop generation"
            >
              <Square size={16} className="text-white" fill="white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSendDisabled}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#3D8BE8] hover:bg-[#2d7bd8] disabled:opacity-40 disabled:cursor-not-allowed rounded-full w-9 h-9 transition-colors duration-200 cursor-pointer"
              aria-label="Send message"
              title="Send message"
            >
              <SendHorizontal size={16} className="text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
