'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

interface ResearchCardProps {
  data: AmplifyDataParts['research-card']
}

export function ResearchCard({ data }: ResearchCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (data.status === 'loading') {
    return <SkeletonPart type="card" />
  }

  const previewFinding = data.findings[0]

  return (
    <div
      className="bg-white border border-slate-200 border-l-[3px] border-l-[#3D8BE8] rounded-xl p-4 cursor-pointer select-none"
      onClick={() => setExpanded((prev) => !prev)}
      role="button"
      aria-expanded={expanded}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm text-slate-900 leading-snug">
          {data.topic}
        </h3>
        <span className="shrink-0 text-slate-400">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </div>

      {/* Collapsed preview — first finding summary */}
      {!expanded && previewFinding && (
        <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">
          <span className="font-medium text-slate-700">{previewFinding.label}:</span>{' '}
          {previewFinding.value}
        </p>
      )}

      {/* Expanded findings */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? `${data.findings.length * 80 + 40}px` : '0px' }}
      >
        {expanded && (
          <div className="mt-3 space-y-3">
            {data.findings.map((finding, i) => (
              <div key={i} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {finding.label}
                </p>
                <p className="mt-0.5 text-sm text-slate-800">{finding.value}</p>
                {finding.source && (
                  <a
                    href={finding.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-[#3D8BE8] underline hover:opacity-80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Source
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
