'use client'

import { useState, useRef } from 'react'

interface ChannelSelectorProps {
  selectedChannels: string[]
  onToggle: (channel: string) => void
  onAddCustom: (name: string) => void
  onGenerate: () => void
  isGenerating: boolean
}

const DEFAULT_CHANNELS = ['Email', 'WhatsApp', 'Instagram', 'Facebook', 'Flyer']

export function ChannelSelector({
  selectedChannels,
  onToggle,
  onAddCustom,
  onGenerate,
  isGenerating,
}: ChannelSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isSelected = (channel: string) => selectedChannels.includes(channel)
  const canGenerate = selectedChannels.length > 0 && !isGenerating

  function handleAddCustomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const trimmed = customValue.trim()
      if (trimmed) {
        onAddCustom(trimmed)
        setCustomValue('')
        setShowCustomInput(false)
      }
    }
    if (e.key === 'Escape') {
      setCustomValue('')
      setShowCustomInput(false)
    }
  }

  function handleCustomBlur() {
    // Close on blur (small delay to allow click events to fire)
    setTimeout(() => {
      setCustomValue('')
      setShowCustomInput(false)
    }, 150)
  }

  function handleCustomChipClick() {
    setShowCustomInput(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Channels to display: defaults + any custom ones added
  const allChannels = [
    ...DEFAULT_CHANNELS,
    ...selectedChannels.filter((ch) => !DEFAULT_CHANNELS.includes(ch)),
  ]

  return (
    <div>
      {/* Channel chips */}
      <div className="flex flex-wrap gap-2">
        {allChannels.map((channel) => {
          const selected = isSelected(channel)
          return (
            <button
              key={channel}
              role="checkbox"
              aria-checked={selected}
              onClick={() => onToggle(channel)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8]',
                'min-h-[44px]',
                selected
                  ? 'bg-[#3D8BE8] text-white border border-[#3D8BE8]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              {channel}
            </button>
          )
        })}

        {/* + Custom chip */}
        {showCustomInput ? (
          <input
            ref={inputRef}
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleAddCustomKeyDown}
            onBlur={handleCustomBlur}
            placeholder="Channel name (e.g. TikTok, LinkedIn)"
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold border border-dashed border-[#3D8BE8]',
              'focus:outline-none focus:ring-2 focus:ring-[#3D8BE8] min-w-[240px] min-h-[44px]',
              'placeholder:text-slate-400 text-slate-900 bg-white',
            ].join(' ')}
          />
        ) : (
          <button
            onClick={handleCustomChipClick}
            className={[
              'bg-slate-100 text-slate-600 border border-dashed border-slate-300 rounded-full px-4 py-2 text-sm font-semibold',
              'hover:border-slate-400 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8] min-h-[44px]',
            ].join(' ')}
          >
            + Custom
          </button>
        )}
      </div>

      {/* Generate Copy CTA */}
      <div className="mt-4">
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={[
            'bg-[#E47D6C] text-white rounded-full font-semibold text-base h-12 w-full sm:w-[200px]',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8]',
            !canGenerate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#d96e5e] cursor-pointer',
          ].join(' ')}
        >
          {isGenerating ? 'Generating...' : 'Generate Copy'}
        </button>
      </div>
    </div>
  )
}
