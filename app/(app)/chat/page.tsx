import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Chat page — placeholder for Phase 2 campaign chat UI
export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile to show display_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, region')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'

  async function handleSignOut() {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-lg w-full text-center">
        {/* Welcome message */}
        <div className="mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold"
            style={{ backgroundColor: '#3D8BE8' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Amplify, {displayName}!
          </h1>
          {profile?.region && (
            <p className="text-gray-500 mt-1 text-sm">{profile.region} region</p>
          )}
        </div>

        {/* Placeholder content */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#E47D6C' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Chat interface coming in Phase 2
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            In Phase 2, you&apos;ll be able to describe your workshop here and receive a complete
            marketing kit — emails, WhatsApp messages, social media posts, and ad creatives —
            all through a simple conversation.
          </p>
        </div>

        {/* Sign out */}
        <div className="mt-8">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
