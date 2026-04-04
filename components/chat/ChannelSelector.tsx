'use client'

import { useState, useRef } from 'react'
import { Plus, Minus } from 'lucide-react'

export interface ChannelQuantity {
  channel: string
  quantity: number
}

interface ChannelSelectorProps {
  selectedChannels: string[]
  channelQuantities?: Record<string, number>
  onToggle: (channel: string) => void
  onQuantityChange: (channel: string, quantity: number) => void
  onAddCustom: (name: string) => void
  onGenerate: () => void
  isGenerating: boolean
}

const DEFAULT_CHANNELS = ['Email', 'WhatsApp', 'Instagram', 'Facebook', 'Flyer']

export function ChannelSelector({
  selectedChannels,
  channelQuantities = {},
  onToggle,
  onQuantityChange,
  onAddCustom,
  onGenerate,
  isGenerating,
}: ChannelSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isSelected = (channel: string) => selectedChannels.includes(channel)
  const getQuantity = (channel: string) => channelQuantities[channel] ?? 1
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
      {/* Channel chips with quantity controls */}
      <div className="flex flex-col gap-2">
        {allChannels.map((channel) => {
          const selected = isSelected(channel)
          const qty = getQuantity(channel)
          return (
            <div key={channel} className="flex items-center gap-2">
              <button
                role="checkbox"
                aria-checked={selected}
                onClick={() => onToggle(channel)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8]',
                  'min-h-[40px] min-w-[120px] text-left',
                  selected
                    ? 'bg-[#3D8BE8] text-white border border-[#3D8BE8]'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                {channel}
              </button>

              {/* Quantity controls — visible when channel is selected */}
              {selected && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onQuantityChange(channel, Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center border transition-colors',
                      qty <= 1
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-600 hover:border-[#3D8BE8] hover:text-[#3D8BE8] cursor-pointer',
                    ].join(' ')}
                    aria-label={`Decrease ${channel} quantity`}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="w-6 text-center text-sm font-semibold text-slate-700 tabular-nums"
                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => onQuantityChange(channel, Math.min(5, qty + 1))}
                    disabled={qty >= 5}
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center border transition-colors',
                      qty >= 5
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-600 hover:border-[#3D8BE8] hover:text-[#3D8BE8] cursor-pointer',
                    ].join(' ')}
                    aria-label={`Increase ${channel} quantity`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* + Custom chip */}
        <div className="flex items-center gap-2">
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
                'focus:outline-none focus:ring-2 focus:ring-[#3D8BE8] min-w-[240px] min-h-[40px]',
                'placeholder:text-slate-400 text-slate-900 bg-white',
              ].join(' ')}
            />
          ) : (
            <button
              onClick={handleCustomChipClick}
              className={[
                'bg-slate-100 text-slate-600 border border-dashed border-slate-300 rounded-full px-4 py-2 text-sm font-semibold',
                'hover:border-slate-400 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8] min-h-[40px]',
              ].join(' ')}
            >
              + Custom
            </button>
          )}
        </div>
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
