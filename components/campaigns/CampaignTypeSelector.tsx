'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Globe, Megaphone, Presentation, Users, Calendar, Sparkles, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CampaignType {
  id: string
  title: string
  description: string
  icon: LucideIcon
  comingSoon: boolean
}

const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: 'intro-workshop',
    title: 'Introductory Workshop',
    description: 'Plan and promote a local introductory workshop',
    icon: BookOpen,
    comingSoon: false,
  },
  {
    id: 'gurudev-tour',
    title: "Gurudev's Tour",
    description: 'Multi-city, multi-event tour campaign for Gurudev Sri Sri Ravi Shankar',
    icon: Globe,
    comingSoon: true,
  },
  {
    id: 'special-event',
    title: 'Special Event with Gurudev',
    description: 'Wisdom Series, Public Talk, or other special events with Gurudev',
    icon: Presentation,
    comingSoon: true,
  },
  {
    id: 'national-campaign',
    title: 'National Ad Campaign',
    description: 'Create high impact ad creatives for all channels with proven ad templates.',
    icon: Megaphone,
    comingSoon: false,
  },
  {
    id: 'india-marketing',
    title: 'India Marketing',
    description: 'National marketing programs in India.',
    icon: Globe,
    comingSoon: false,
  },
  {
    id: 'state-campaign',
    title: 'State Campaign',
    description: 'State-specific programs with national guidelines',
    icon: Users,
    comingSoon: true,
  },
  {
    id: 'city-campaign',
    title: 'City Campaign',
    description: 'City-focused events like Health Yoga Week, Farmers Market',
    icon: Calendar,
    comingSoon: true,
  },
  {
    id: 'special-event-local',
    title: 'Special Event',
    description: 'One-off events and special programs',
    icon: Sparkles,
    comingSoon: true,
  },
  {
    id: 'graduate-workshop',
    title: 'Graduate Workshop',
    description: 'Advanced workshops for Art of Living graduates',
    icon: Zap,
    comingSoon: true,
  },
]

export function CampaignTypeSelector() {
  const router = useRouter()
  const [creating, setCreating] = useState<string | null>(null)

  async function handleSelect(campaignType: CampaignType) {
    if (campaignType.comingSoon || creating) return

    setCreating(campaignType.id)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: campaignType.id }),
      })
      if (res.ok) {
        const campaign = await res.json()
        router.push(`/chat/${campaign.id}`)
      } else {
        setCreating(null)
      }
    } catch {
      setCreating(null)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {CAMPAIGN_TYPES.map((type) => {
        const Icon = type.icon
        const isDisabled = type.comingSoon || creating !== null
        const isCreating = creating === type.id

        return (
          <button
            key={type.id}
            onClick={() => handleSelect(type)}
            disabled={isDisabled}
            className={`relative flex items-start gap-4 rounded-xl border bg-white p-5 text-left transition-all duration-200 ${
              type.comingSoon
                ? 'opacity-50 cursor-not-allowed border-slate-200'
                : isCreating
                  ? 'border-[#3D8BE8] bg-blue-50 cursor-wait'
                  : 'border-slate-200 hover:border-[#3D8BE8] hover:shadow-md cursor-pointer'
            }`}
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            {/* Left accent bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-200 ${
                type.comingSoon ? 'bg-gray-300' : 'bg-[#3D8BE8]'
              }`}
            />

            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
                type.comingSoon ? 'bg-gray-200' : 'bg-[#3D8BE8]'
              }`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-medium text-slate-900"
                  style={{ fontSize: '15px' }}
                >
                  {type.title}
                </h3>
                {type.comingSoon && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                {type.description}
              </p>
            </div>

            {isCreating && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 rounded-full border-2 border-[#3D8BE8] border-t-transparent animate-spin" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
