'use client'

import { Download } from 'lucide-react'

interface FlyerFrameProps {
  content: string
  imageUrl?: string
  imageStatus?: 'generating' | 'ready' | 'failed'
  imageAssetId?: string
  onRetry?: () => void
  onDownload?: (url: string, filename: string) => void
}

function handleDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export function FlyerFrame({ content, imageUrl, imageStatus, onRetry }: FlyerFrameProps) {
  return (
    <div className="max-w-[350px] rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* Thick top bar */}
      <div className="bg-[#3D8BE8] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2">
        Flyer
      </div>
      {/* Image area */}
      {imageStatus === 'generating' && (
        <div className="aspect-[2/3] bg-slate-100 animate-pulse rounded" />
      )}
      {imageUrl && imageStatus === 'ready' && (
        <div>
          <img src={imageUrl} alt="Flyer ad creative" className="w-full aspect-[2/3] object-cover" />
          <div className="px-4 pt-2">
            <button
              onClick={() => handleDownload(imageUrl, 'flyer-ad.png')}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              data-download="flyer-ad.png"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
      )}
      {imageStatus === 'failed' && (
        <div className="aspect-[2/3] bg-slate-100 flex flex-col items-center justify-center gap-2 rounded">
          <p className="text-xs text-slate-500">Image generation failed</p>
          <button onClick={onRetry} className="text-sm text-[#3D8BE8] underline cursor-pointer">
            Retry
          </button>
        </div>
      )}
      {/* Body */}
      <div className="p-4 text-center">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  )
}
