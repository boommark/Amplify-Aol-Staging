'use client'

import { useState } from 'react'
import {
  Moon,
  Brain,
  Sparkles,
  Calendar,
  MessageCircle,
  Heart,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

const DIMENSION_CONFIG: Record<string, { label: string; Icon: typeof Moon; color: string }> = {
  sleep_health: { label: 'Sleep & Health', Icon: Moon, color: '#6366F1' },
  mental_health: { label: 'Mental Health', Icon: Brain, color: '#8B5CF6' },
  spirituality: { label: 'Spirituality', Icon: Sparkles, color: '#F59E0B' },
  seasonal: { label: 'Seasonal', Icon: Calendar, color: '#10B981' },
  local_idioms: { label: 'Local Idioms', Icon: MessageCircle, color: '#3B82F6' },
  relationships: { label: 'Relationships', Icon: Heart, color: '#EF4444' },
  cultural_sensitivities: { label: 'Cultural Sensitivities', Icon: Globe, color: '#14B8A6' },
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
    Icon: Globe,
    color: '#64748B',
  }

  const { Icon } = config
  const summary = data.summary || data.findings[0]?.value?.slice(0, 150) || ''

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
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <p
            className="text-sm text-slate-600 mt-1 line-clamp-2"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            {summary}
          </p>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-12 border-t border-slate-100">
          <ul className="space-y-2 mt-3">
            {data.findings.map((f, i) => (
              <li
                key={i}
                className="text-sm text-slate-700"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              >
                <span className="font-medium">{f.label}:</span> {f.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
