import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkEmailAllowlist } from '@/lib/auth/allowlist'
import { assignDefaultRole } from '@/lib/auth/assign-default-role'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  try {
    const supabase = await createClient()

    // PKCE flow: exchange code for session
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError.message)
        const msg = encodeURIComponent(exchangeError.message)
        return NextResponse.redirect(`${origin}/login?error=auth_failed&detail=${msg}`)
      }
    }

    // Check if user is authenticated (works for both PKCE and implicit flows)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user || !user.email) {
      // No code AND no session — nothing to work with
      console.error('Get user error:', userError?.message || 'no user')
      return NextResponse.redirect(`${origin}/login?error=auth_failed&detail=no_session`)
    }

    // Check email allowlist
    const isAllowed = await checkEmailAllowlist(user.email)
    if (!isAllowed) {
      await supabase.auth.signOut()
      const email = encodeURIComponent(user.email)
      return NextResponse.redirect(`${origin}/login?access=denied&email=${email}`)
    }

    // Check if profile exists (determines first login vs returning user)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, region')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // First login: assign default role and create profile
      await assignDefaultRole(user.id)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email.toLowerCase(),
          role: 'teacher',
        })
      if (insertError) {
        console.error('Profile insert error:', insertError.message)
      }
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Check if onboarding is complete
    if (!profile.display_name || !profile.region) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Returning user: go to chat
    return NextResponse.redirect(`${origin}/chat`)
  } catch (error: any) {
    console.error('Callback error:', error)
    const msg = encodeURIComponent(error?.message || 'unknown')
    return NextResponse.redirect(`${origin}/login?error=auth_failed&detail=${msg}`)
  }
}
