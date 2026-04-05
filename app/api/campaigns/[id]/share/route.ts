import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 300

// POST: Generate or return existing share token
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if campaign belongs to user
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, share_token, user_id')
    .eq('id', id)
    .single()
  if (!campaign || campaign.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Return existing token or generate new one
  let shareToken = campaign.share_token as string | null
  if (!shareToken) {
    shareToken = randomUUID()
    await supabase.from('campaigns').update({ share_token: shareToken }).eq('id', id)
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${shareToken}`
  return NextResponse.json({ shareToken, shareUrl })
}

// GET: Check if share token exists
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('share_token')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const shareUrl = campaign.share_token
    ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${campaign.share_token}`
    : null
  return NextResponse.json({ shareToken: campaign.share_token, shareUrl })
}
