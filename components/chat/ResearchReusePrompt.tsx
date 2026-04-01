'use client'

import { Info } from 'lucide-react'

interface ResearchReusePromptProps {
  campaignName: string
  onReuse: () => void
  onFresh: () => void
}

export function ResearchReusePrompt({
  campaignName,
  onReuse,
  onFresh,
}: ResearchReusePromptProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        {/* Info icon */}
        <Info className="w-5 h-5 text-[#3D8BE8] shrink-0 mt-0.5" aria-hidden="true" />

        {/* Message */}
        <p className="text-sm text-slate-800 flex-1">
          I found research from your <strong>{campaignName}</strong> campaign. Want to use it or run fresh?
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-3 ml-8">
        <button
          onClick={onReuse}
          className={[
            'min-h-[44px] border border-slate-200 rounded-full px-4 py-2 text-sm font-medium',
            'text-slate-700 hover:border-[#3D8BE8] hover:text-[#3D8BE8] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8]',
          ].join(' ')}
        >
          Use existing
        </button>
        <button
          onClick={onFresh}
          className={[
            'min-h-[44px] border border-slate-200 rounded-full px-4 py-2 text-sm font-medium',
            'text-slate-700 hover:border-[#3D8BE8] hover:text-[#3D8BE8] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8BE8]',
          ].join(' ')}
        >
          Run fresh
        </button>
      </div>
    </div>
  )
}
