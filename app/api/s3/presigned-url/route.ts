import { createClient } from '@/lib/supabase/server'
import { generatePresignedUploadUrl } from '@/lib/s3/presigned-url'
import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { key, contentType } = body

  if (!key || !contentType) {
    return NextResponse.json(
      { error: 'Missing required fields: key, contentType' },
      { status: 400 }
    )
  }

  // Prefix key with user ID to prevent overwrites across users
  const prefixedKey = `${user.id}/${key}`

  const result = await generatePresignedUploadUrl(prefixedKey, contentType)
  return NextResponse.json(result)
}
