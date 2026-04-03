'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Moon,
  Brain,
  Sparkles,
  Calendar,
  Heart,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

const DIMENSION_CONFIG: Record<string, { label: string; subtitle: string; Icon: typeof Moon; color: string }> = {
  mental_health: {
    label: 'Mental Health & Wellness',
    subtitle: 'Why people in your area are seeking wellness solutions',
    Icon: Brain, color: '#8B5CF6',
  },
  spirituality: {
    label: 'Spiritual Interest',
    subtitle: 'What draws residents to meditation and spiritual growth',
    Icon: Sparkles, color: '#F59E0B',
  },
  cultural_sensitivities: {
    label: 'How to Talk About It',
    subtitle: 'Local tone, language, and sensitivities for your messaging',
    Icon: Globe, color: '#14B8A6',
  },
  seasonal: {
    label: "What's Happening Locally",
    subtitle: 'Events, holidays, and seasonal angles near your course dates',
    Icon: Calendar, color: '#10B981',
  },
  relationships: {
    label: 'Community & Relationships',
    subtitle: 'How people connect and what relationship challenges exist',
    Icon: Heart, color: '#EF4444',
  },
  sleep_health: {
    label: 'Sleep & Physical Health',
    subtitle: 'Physical wellness concerns you can address in your marketing',
    Icon: Moon, color: '#6366F1',
  },
}

/** Strip markdown artifacts and citation refs from display text */
function cleanDisplayText(text: string): string {
  return text
    .replace(/\[[\d,\s]+\]/g, '')   // Citation refs [1], [2][3]
    .replace(/\*\*/g, '')            // Bold **
    .replace(/(?<!\w)\*(?!\*)/g, '') // Italic *
    .replace(/^#+\s*/gm, '')         // Headers ##
    .replace(/\s{2,}/g, ' ')         // Collapse whitespace
    .trim()
}

interface ResearchCardProps {
  data: AmplifyDataParts['research-card']
}

export function ResearchCard({ data }: ResearchCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (data.status === 'loading') {
    return <SkeletonPart type="card" />
  }

  const config = DIMENSION_CONFIG[data.topic] || {
    label: data.topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: '',
    Icon: Globe,
    color: '#64748B',
  }

  const { Icon } = config
  const summary = cleanDisplayText(data.summary || data.findings[0]?.value?.slice(0, 150) || '')

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
        style={{ borderLeft: `4px solid ${config.color}` }}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className="font-medium text-slate-900 text-sm"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              {config.label}
            </h4>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </div>
          {!expanded && config.subtitle && (
            <p
              className="text-xs text-slate-400 mt-0.5"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              {config.subtitle}
            </p>
          )}
          <p
            className="text-sm text-slate-600 mt-1 line-clamp-2"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            {summary}
          </p>
        </div>
      </button>
      {expanded && (
        <div
          className="px-4 pb-4 pt-2 ml-12 border-t border-slate-100
            prose prose-sm prose-slate max-w-none
            prose-p:my-1.5 prose-p:leading-relaxed
            prose-ul:my-1.5 prose-ul:pl-4 prose-ol:my-1.5 prose-ol:pl-4
            prose-li:my-0.5 prose-li:leading-relaxed
            prose-strong:font-semibold prose-strong:text-slate-800
            prose-headings:font-semibold prose-headings:text-slate-800 prose-headings:mt-3 prose-headings:mb-1
            prose-h3:text-sm prose-h4:text-sm"
          style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '14px' }}
        >
          {data.findings.map((f, i) => {
            const cleanValue = cleanDisplayText(f.value)
            // If label is "Finding N", just render the value as markdown
            const isGenericLabel = /^Finding \d+$/.test(f.label)

            return (
              <div key={i} className="mb-2 last:mb-0">
                {!isGenericLabel && (
                  <span className="font-semibold text-slate-800">{cleanDisplayText(f.label)}: </span>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <span className="inline">{children}</span>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3D8BE8] underline decoration-[#3D8BE8]/30 hover:decoration-[#3D8BE8]"
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => <ul className="mt-1 space-y-0.5 list-disc pl-4">{children}</ul>,
                    li: ({ children }) => <li className="text-sm text-slate-700 leading-relaxed">{children}</li>,
                  }}
                >
                  {cleanValue}
                </ReactMarkdown>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
