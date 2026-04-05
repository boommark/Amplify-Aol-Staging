import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import archiver from 'archiver'
import { PassThrough } from 'stream'

export const maxDuration = 300

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify campaign belongs to user
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, user_id')
    .eq('id', id)
    .single()
  if (!campaign || campaign.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch all assets
  const { data: assets } = await supabase
    .from('campaign_assets')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at')
  if (!assets || assets.length === 0) {
    return NextResponse.json({ error: 'No assets to export' }, { status: 404 })
  }

  // Create archive
  const archive = archiver('zip', { zlib: { level: 6 } })
  const passthrough = new PassThrough()
  archive.pipe(passthrough)

  // Add each asset to archive
  for (const asset of assets) {
    if (
      asset.asset_type === 'ad_creative' ||
      asset.asset_type === 'image' ||
      asset.asset_type === 'quote_image'
    ) {
      // Fetch image from S3 URL and add as PNG
      try {
        if (asset.s3_url) {
          const response = await fetch(asset.s3_url as string)
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer())
            const filename = `${asset.channel || 'image'}-${asset.asset_type}.png`
            archive.append(buffer, { name: filename })
          }
        }
      } catch {
        /* skip failed fetches */
      }
    } else if (asset.asset_type === 'copy') {
      // Add copy as text file — read from asset.content column (NOT metadata.content)
      // Phase 3 saveAsset writes copy to the `content` column in campaign_assets
      const content = (asset.content as string) || ''
      const filename = `${asset.channel || 'copy'}-copy.txt`
      archive.append(content, { name: filename })
    }
  }

  await archive.finalize()

  // Convert PassThrough stream to Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      passthrough.on('data', (chunk: Buffer) => controller.enqueue(chunk))
      passthrough.on('end', () => controller.close())
      passthrough.on('error', (err: Error) => controller.error(err))
    },
  })

  const safeTitle = (campaign.title || 'campaign').replace(/[^a-zA-Z0-9-_]/g, '_')
  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeTitle}-assets.zip"`,
    },
  })
}
