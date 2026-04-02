import { createClient } from '@/lib/supabase/server'
import { updateCampaign, deleteCampaign } from '@/lib/db/campaigns'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: RouteContext) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { id } = await context.params
  if (!id) return new Response('Campaign ID required', { status: 400 })

  const body = await req.json()
  const { title } = body as { title?: string }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return new Response('title is required', { status: 400 })
  }

  // Ensure the campaign belongs to this user before updating
  const { data: existing } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!existing) return new Response('Not found', { status: 404 })

  const campaign = await updateCampaign(id, { title: title.trim() })
  return NextResponse.json(campaign)
}

export async function DELETE(_req: Request, context: RouteContext) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { id } = await context.params
  if (!id) return new Response('Campaign ID required', { status: 400 })

  // Ensure the campaign belongs to this user before deleting
  const { data: existing } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!existing) return new Response('Not found', { status: 404 })

  await deleteCampaign(id)
  return new Response(null, { status: 204 })
}
