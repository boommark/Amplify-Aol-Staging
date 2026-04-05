'use client'

import { Download, Heart, MessageCircle, Send, ThumbsUp } from 'lucide-react'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'
import { FlyerFrame } from './FlyerFrame'

interface ChannelImageProps {
  imageUrl?: string
  imageStatus?: 'generating' | 'ready' | 'failed'
  aspectClass: string
  onRetry?: () => void
}

function ChannelImageArea({ imageUrl, imageStatus, aspectClass, onRetry }: ChannelImageProps) {
  if (imageStatus === 'generating') {
    return <div className={`bg-slate-100 ${aspectClass} animate-pulse rounded`} />
  }
  if (imageUrl && imageStatus === 'ready') {
    return <img src={imageUrl} alt="Ad creative" className={`w-full ${aspectClass} object-cover rounded`} />
  }
  if (imageStatus === 'failed') {
    return (
      <div className={`bg-slate-100 ${aspectClass} flex flex-col items-center justify-center gap-2 rounded`}>
        <p className="text-xs text-slate-500">Image generation failed</p>
        <button onClick={onRetry} className="text-sm text-[#3D8BE8] underline cursor-pointer">
          Retry
        </button>
      </div>
    )
  }
  return null
}

interface CopyBlockProps {
  data: AmplifyDataParts['copy-block']
  onRetry?: (channel: string) => void
}

function handleDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

function WhatsAppFrame({
  content,
  imageUrl,
  imageStatus,
  onRetry,
}: {
  content: string
  imageUrl?: string
  imageStatus?: 'generating' | 'ready' | 'failed'
  imageAssetId?: string
  onRetry?: () => void
  onDownload?: (url: string, filename: string) => void
}) {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-md max-w-[300px]">
      {/* Header bar */}
      <div className="bg-[#075E54] text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          A
        </div>
        WhatsApp
      </div>
      {/* Image area (above message bubble) */}
      {(imageStatus || imageUrl) && (
        <div className="px-3 pt-3">
          <ChannelImageArea
            imageUrl={imageUrl}
            imageStatus={imageStatus}
            aspectClass="aspect-square"
            onRetry={onRetry}
          />
          {imageUrl && imageStatus === 'ready' && (
            <div className="mt-1">
              <button
                onClick={() => handleDownload(imageUrl, 'whatsapp-ad.png')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          )}
        </div>
      )}
      {/* Chat background */}
      <div className="bg-[#E5DDD5] p-3 min-h-[80px]">
        {/* Sent message bubble */}
        <div className="bg-[#DCF8C6] rounded-lg p-3 text-sm text-slate-900 max-w-[85%] ml-auto shadow-sm">
          <p className="whitespace-pre-wrap break-words">{content}</p>
          <p className="text-xs text-slate-500 text-right mt-1">{time} ✓✓</p>
        </div>
      </div>
    </div>
  )
}

function InstagramFrame({
  content,
  imageUrl,
  imageStatus,
  onRetry,
}: {
  content: string
  imageUrl?: string
  imageStatus?: 'generating' | 'ready' | 'failed'
  imageAssetId?: string
  onRetry?: () => void
  onDownload?: (url: string, filename: string) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white max-w-[350px] shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
        <span className="text-sm font-medium text-slate-900">amplify_aol</span>
        <span className="ml-auto text-xs text-slate-400">Sponsored</span>
      </div>
      {/* Image area */}
      {imageStatus || imageUrl ? (
        <div>
          <ChannelImageArea
            imageUrl={imageUrl}
            imageStatus={imageStatus}
            aspectClass="aspect-square"
            onRetry={onRetry}
          />
          {imageUrl && imageStatus === 'ready' && (
            <div className="px-3 mt-1">
              <button
                onClick={() => handleDownload(imageUrl, 'instagram-ad.png')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                data-download="instagram-ad.png"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-100 aspect-square flex items-center justify-center text-slate-400 text-xs">
          Image Preview
        </div>
      )}
      {/* Action bar */}
      <div className="flex items-center gap-4 px-3 py-2">
        <Heart className="w-5 h-5 text-slate-700 cursor-pointer hover:text-red-500 transition-colors" />
        <MessageCircle className="w-5 h-5 text-slate-700 cursor-pointer" />
        <Send className="w-5 h-5 text-slate-700 cursor-pointer" />
      </div>
      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  )
}

function EmailFrame({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white max-w-[400px] shadow-sm">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-3">
        <button className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
          Reply
        </button>
        <button className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
          Forward
        </button>
      </div>
      {/* Email headers */}
      <div className="px-4 py-3 border-b border-slate-100 space-y-1">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700 w-16 inline-block">From:</span>
          amplify@amplifyaol.com
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700 w-16 inline-block">To:</span>
          your-audience@example.com
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700 w-16 inline-block">Subject:</span>
          Marketing Campaign
        </p>
      </div>
      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  )
}

function FacebookFrame({
  content,
  imageUrl,
  imageStatus,
  onRetry,
}: {
  content: string
  imageUrl?: string
  imageStatus?: 'generating' | 'ready' | 'failed'
  imageAssetId?: string
  onRetry?: () => void
  onDownload?: (url: string, filename: string) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white max-w-[350px] shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold shrink-0">
          A
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 leading-none">Amplify AOL</p>
          <p className="text-xs text-slate-400 mt-0.5">Sponsored</p>
        </div>
      </div>
      {/* Content */}
      <div className="px-3 py-2.5">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
      {/* Image area */}
      {imageStatus || imageUrl ? (
        <div>
          <ChannelImageArea
            imageUrl={imageUrl}
            imageStatus={imageStatus}
            aspectClass="aspect-video"
            onRetry={onRetry}
          />
          {imageUrl && imageStatus === 'ready' && (
            <div className="px-3 mt-1">
              <button
                onClick={() => handleDownload(imageUrl, 'facebook-ad.png')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                data-download="facebook-ad.png"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-100 aspect-video flex items-center justify-center text-slate-400 text-xs">
          Ad Image
        </div>
      )}
      {/* Engagement bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100">
        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1877F2] cursor-pointer transition-colors px-3 py-1.5 rounded hover:bg-slate-50 flex-1 justify-center">
          <ThumbsUp className="w-4 h-4" />
          Like
        </button>
        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1877F2] cursor-pointer transition-colors px-3 py-1.5 rounded hover:bg-slate-50 flex-1 justify-center">
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1877F2] cursor-pointer transition-colors px-3 py-1.5 rounded hover:bg-slate-50 flex-1 justify-center">
          <Send className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}

export function CopyBlock({ data, onRetry }: CopyBlockProps) {
  if (data.status === 'loading') {
    return <SkeletonPart type="card" />
  }

  const handleRetry = onRetry ? () => onRetry(data.channel) : undefined

  switch (data.channel) {
    case 'whatsapp':
      return (
        <WhatsAppFrame
          content={data.content}
          imageUrl={data.imageUrl}
          imageStatus={data.imageStatus}
          imageAssetId={data.imageAssetId}
          onRetry={handleRetry}
        />
      )
    case 'instagram':
      return (
        <InstagramFrame
          content={data.content}
          imageUrl={data.imageUrl}
          imageStatus={data.imageStatus}
          imageAssetId={data.imageAssetId}
          onRetry={handleRetry}
        />
      )
    case 'email':
      return <EmailFrame content={data.content} />
    case 'facebook':
      return (
        <FacebookFrame
          content={data.content}
          imageUrl={data.imageUrl}
          imageStatus={data.imageStatus}
          imageAssetId={data.imageAssetId}
          onRetry={handleRetry}
        />
      )
    case 'flyer':
      return (
        <FlyerFrame
          content={data.content}
          imageUrl={data.imageUrl}
          imageStatus={data.imageStatus}
          imageAssetId={data.imageAssetId}
          onRetry={handleRetry}
        />
      )
    default:
      return (
        <div className="rounded-xl border border-slate-200 bg-white max-w-[350px] shadow-sm overflow-hidden">
          <div className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider px-4 py-2">
            {data.channel}
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{data.content}</p>
          </div>
        </div>
      )
  }
}
