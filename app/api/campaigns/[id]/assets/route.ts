import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: assets, error } = await supabase
    .from('campaign_assets')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(assets)
}
