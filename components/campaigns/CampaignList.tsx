'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { isToday, isYesterday, differenceInCalendarDays } from 'date-fns'
import { BookOpen, Globe, Megaphone, Users, Calendar, Sparkles, Zap, Presentation, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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

// ---------------------------------------------------------------------------
// CampaignItem — handles rename, delete, and the three-dot menu per row
// ---------------------------------------------------------------------------

interface CampaignItemProps {
  campaign: Campaign
  isActive: boolean
  onRenamed: (id: string, title: string) => void
  onDeleted: (id: string) => void
}

function CampaignItem({ campaign, isActive, onRenamed, onDeleted }: CampaignItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(campaign.title ?? '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const IconComponent = campaign.event_type
    ? (EVENT_TYPE_ICONS[campaign.event_type] ?? BookOpen)
    : BookOpen

  // Focus input when rename mode activates
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleRenameStart = () => {
    setRenameValue(campaign.title ?? '')
    setIsRenaming(true)
    setMenuOpen(false)
  }

  const handleRenameSave = async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === (campaign.title ?? '')) {
      setIsRenaming(false)
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      if (res.ok) {
        onRenamed(campaign.id, trimmed)
      }
    } catch {
      // Silent — user can try again
    } finally {
      setIsSaving(false)
      setIsRenaming(false)
    }
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSave()
    if (e.key === 'Escape') setIsRenaming(false)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDeleted(campaign.id)
        // If we're currently viewing the deleted campaign, go to /chat
        if (isActive) router.push('/chat')
      }
    } catch {
      // Silent
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <li className="relative group">
      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="mx-1 my-0.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <p
            className="text-xs text-slate-700 mb-2"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            Delete this campaign?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded px-2 py-1 transition-colors"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main row */}
      {!showDeleteConfirm && (
        <div
          className={`flex items-center gap-2 px-3 py-2 mx-1 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-50 border-l-2 border-l-[#3D8BE8]'
              : 'hover:bg-gray-50'
          }`}
        >
          <IconComponent className="w-4 h-4 flex-shrink-0 text-slate-400" />

          {isRenaming ? (
            /* Inline rename input */
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={handleRenameSave}
              disabled={isSaving}
              className="flex-1 min-w-0 text-sm text-slate-900 bg-white border border-[#3D8BE8] rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-[#3D8BE8] disabled:opacity-50"
              style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '14px' }}
            />
          ) : (
            /* Normal link */
            <Link
              href={`/chat/${campaign.id}`}
              className="flex-1 min-w-0 truncate text-slate-900"
              style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '14px' }}
            >
              {campaign.title ?? 'Untitled campaign'}
            </Link>
          )}

          {/* Three-dot menu button — visible on row hover or when menu is open */}
          {!isRenaming && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen((prev) => !prev)
                }}
                className={`flex-shrink-0 p-0.5 rounded transition-opacity text-slate-400 hover:text-slate-600 hover:bg-slate-100 ${
                  menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                aria-label="Campaign options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-slate-100 bg-white shadow-md z-50 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRenameStart()
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMenuOpen(false)
                      setShowDeleteConfirm(true)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

// ---------------------------------------------------------------------------
// CampaignList — top-level list with fetch and group-by-recency logic
// ---------------------------------------------------------------------------

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

  const handleRenamed = useCallback((id: string, title: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    )
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }, [])

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
              return (
                <CampaignItem
                  key={campaign.id}
                  campaign={campaign}
                  isActive={isActive}
                  onRenamed={handleRenamed}
                  onDeleted={handleDeleted}
                />
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
