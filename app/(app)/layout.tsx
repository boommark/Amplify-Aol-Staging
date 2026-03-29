import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type React from 'react'

// Authenticated app shell — requires active session and complete profile
// No 'use client' — this is a Server Component
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Belt-and-suspenders auth check (middleware handles this first)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if profile is complete (has display_name and region)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, region, email')
    .eq('id', user.id)
    .single()

  // If profile missing or incomplete, redirect to onboarding
  // Use x-pathname header (set by middleware) to detect onboarding page and avoid infinite redirect
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isOnboardingPage = pathname === '/onboarding'
  if (!isOnboardingPage && (!profile?.display_name || !profile?.region)) {
    redirect('/onboarding')
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'

  async function handleSignOut() {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div
            className="inline-block px-4 py-1.5 rounded-lg"
            style={{ backgroundColor: '#3D8BE8' }}
          >
            <span className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Amplify
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">AI Marketing Copilot</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* New Campaign button */}
          <a
            href="/chat"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: '#3D8BE8' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </a>

          {/* TODO Phase 2: past campaigns list */}
          {/* This section will render the list of the user's past campaigns */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
              Recent Campaigns
            </p>
            <p className="text-sm text-gray-300 px-4 py-2 italic">
              {/* TODO Phase 2: past campaigns list — render campaign history here */}
              Your campaigns will appear here
            </p>
          </div>
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-medium"
                style={{ backgroundColor: '#E47D6C' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 truncate">{displayName}</span>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-2"
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div
          className="inline-block px-3 py-1 rounded-lg"
          style={{ backgroundColor: '#3D8BE8' }}
        >
          <span className="text-white font-bold text-sm tracking-wide">Amplify</span>
        </div>
        <a href="/chat" className="text-sm font-medium" style={{ color: '#3D8BE8' }}>
          New Campaign
        </a>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
