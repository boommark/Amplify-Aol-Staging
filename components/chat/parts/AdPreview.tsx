'use client'

import Image from 'next/image'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

interface AdPreviewProps {
  data: AmplifyDataParts['ad-preview']
}

const ORIENTATION_CLASSES: Record<string, string> = {
  square: 'aspect-square w-[250px]',
  vertical: 'aspect-[9/16] w-[200px]',
  horizontal: 'aspect-[16/9] w-[350px]',
}

const ORIENTATION_LABELS: Record<string, string> = {
  square: 'Square',
  vertical: 'Vertical',
  horizontal: 'Horizontal',
}

export function AdPreview({ data }: AdPreviewProps) {
  if (data.status === 'loading') {
    return <SkeletonPart type="image" />
  }

  const dimensionClass = ORIENTATION_CLASSES[data.orientation] ?? ORIENTATION_CLASSES.square
  const orientationLabel = ORIENTATION_LABELS[data.orientation] ?? data.orientation

  return (
    <div className="inline-block">
      <div
        className={`relative ${dimensionClass} rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100`}
      >
        {data.imageUrl ? (
          <Image
            src={data.imageUrl}
            alt={`${data.adType} ad preview`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Ad Preview
          </div>
        )}

        {/* Orientation badge */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          {orientationLabel}
        </div>
      </div>

      {/* Ad type label */}
      <p className="text-sm text-slate-600 mt-2">{data.adType}</p>
    </div>
  )
}
