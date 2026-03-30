'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isToday, isYesterday, differenceInCalendarDays } from 'date-fns'
import { BookOpen, Globe, Megaphone, Users, Calendar, Sparkles, Zap, Presentation } from 'lucide-react'
import type { Campaign } from '@/types/campaign'

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  'intro-workshop': BookOpen,
  'gurudev-tour': Globe,
  'special-event': Presentation,
  'national-campaign': Megaphone,
  'india-marketing': Globe,
  'state-campaign': Users,
  'city-campaign': Calendar,
  'special-event-local': Sparkles,
  'graduate-workshop': Zap,
}

type RecencyGroup = {
  label: string
  campaigns: Campaign[]
}

function groupByRecency(campaigns: Campaign[]): RecencyGroup[] {
  const today: Campaign[] = []
  const yesterday: Campaign[] = []
  const last7Days: Campaign[] = []
  const older: Campaign[] = []

  for (const campaign of campaigns) {
    const date = new Date(campaign.updated_at)
    if (isToday(date)) {
      today.push(campaign)
    } else if (isYesterday(date)) {
      yesterday.push(campaign)
    } else if (differenceInCalendarDays(new Date(), date) <= 7) {
      last7Days.push(campaign)
    } else {
      older.push(campaign)
    }
  }

  const groups: RecencyGroup[] = []
  if (today.length > 0) groups.push({ label: 'Today', campaigns: today })
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', campaigns: yesterday })
  if (last7Days.length > 0) groups.push({ label: 'Last 7 days', campaigns: last7Days })
  if (older.length > 0) groups.push({ label: 'Older', campaigns: older })
  return groups
}

interface CampaignListProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>
}

export function CampaignList({ onRefreshRef }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (res.ok) {
        const data: Campaign[] = await res.json()
        setCampaigns(data)
      }
    } catch {
      // Silent failure — sidebar list is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Expose refresh function via ref so parent can trigger after campaign creation
  useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef.current = fetchCampaigns
    }
  }, [onRefreshRef, fetchCampaigns])

  if (loading) {
    return (
      <div className="space-y-2 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse mx-1" />
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-slate-400 px-4 py-2 italic" style={{ fontFamily: 'Work Sans, sans-serif' }}>
        Your campaigns will appear here
      </p>
    )
  }

  const groups = groupByRecency(campaigns)

  return (
    <div className="space-y-4 pt-2">
      {groups.map((group) => (
        <div key={group.label}>
          <p
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 mb-1"
            style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '12px' }}
          >
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.campaigns.map((campaign) => {
              const isActive = pathname === `/chat/${campaign.id}`
              const IconComponent = campaign.event_type
                ? (EVENT_TYPE_ICONS[campaign.event_type] ?? BookOpen)
                : BookOpen
              return (
                <li key={campaign.id}>
                  <Link
                    href={`/chat/${campaign.id}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 border-l-2 border-l-[#3D8BE8]'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '14px' }}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="truncate text-slate-900">
                      {campaign.title ?? 'Untitled campaign'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
