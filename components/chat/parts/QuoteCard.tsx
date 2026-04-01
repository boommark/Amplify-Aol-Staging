'use client'

import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

interface QuoteCardProps {
  data: AmplifyDataParts['quote-card']
}

type Format = 'short' | 'medium' | 'long'
const FORMATS: { key: Format; label: string }[] = [
  { key: 'short', label: 'Short' },
  { key: 'medium', label: 'Medium' },
  { key: 'long', label: 'Long' },
]

export function QuoteCard({ data }: QuoteCardProps) {
  const [activeFormat, setActiveFormat] = useState<Format>('medium')
  const [copied, setCopied] = useState(false)

  if (data.status === 'loading') {
    return <SkeletonPart type="card" />
  }

  const quoteText = data[activeFormat]

  async function handleCopy() {
    await navigator.clipboard.writeText(quoteText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* Optional image background */}
      {data.imageUrl && (
        <div className="relative rounded-t-2xl overflow-hidden mb-0">
          <img
            src={data.imageUrl}
            alt=""
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Overlay quote text on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {data.isManual && (
              <p className="text-xs text-white/80 italic mb-2">
                This text is not from Gurudev, but written by the AskGurudev Team
              </p>
            )}
            <p className="font-heading text-xl font-semibold italic text-white leading-snug">
              &ldquo;{quoteText}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Quote text (no image) */}
        {!data.imageUrl && (
          <>
            {data.isManual && (
              <p className="text-xs text-slate-500 italic mb-2">
                This text is not from Gurudev, but written by the AskGurudev Team
              </p>
            )}
            <p className="font-heading text-xl font-semibold italic text-slate-900 leading-snug">
              &ldquo;{quoteText}&rdquo;
            </p>
          </>
        )}

        {/* Format tabs */}
        <div
          role="tablist"
          aria-label="Quote format"
          className="flex gap-4 mt-3 border-b border-slate-100 pb-2"
        >
          {FORMATS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeFormat === key}
              onClick={() => setActiveFormat(key)}
              className={[
                'text-sm pb-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8] rounded',
                activeFormat === key
                  ? 'text-[#3D8BE8] border-b-2 border-[#3D8BE8] font-semibold'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Source meta */}
        <p className="text-xs text-slate-500 mt-2">
          {data.source}
          {data.date ? ` - ${data.date}` : ''}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            aria-label="Copy to clipboard"
            onClick={handleCopy}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-[#3D8BE8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8] rounded"
          >
            {copied ? (
              <Check className="w-[14px] h-[14px] text-[#22C55E]" />
            ) : (
              <Copy className="w-[14px] h-[14px]" />
            )}
          </button>
          <button
            aria-label="Download quote card"
            onClick={() => {
              // Placeholder — download handler wired in Phase 3 Plan 02
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-[#3D8BE8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8] rounded"
          >
            <Download className="w-[14px] h-[14px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
