'use client'

import { useState, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Check } from 'lucide-react'
import Image from 'next/image'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

interface ImageCarouselProps {
  data: AmplifyDataParts['image-carousel']
}

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-[16/9]',
}

export function ImageCarousel({ data }: ImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [emblaRef] = useEmblaCarousel({ dragFree: true })

  const handleSelect = useCallback(
    (index: number) => {
      if (!data.selectable) return
      setSelectedIndex((prev) => (prev === index ? null : index))
    },
    [data.selectable]
  )

  if (data.status === 'loading') {
    return (
      <div className="flex gap-3">
        <SkeletonPart type="image" />
        <SkeletonPart type="image" />
        <SkeletonPart type="image" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-3">
        {data.images.map((image, index) => {
          const isSelected = selectedIndex === index
          const aspectClass = ASPECT_RATIO_CLASSES[image.aspectRatio] ?? 'aspect-square'

          return (
            <div
              key={index}
              className={[
                'relative flex-shrink-0 w-[200px] rounded-xl overflow-hidden border',
                isSelected ? 'ring-2 ring-[#3D8BE8] border-[#3D8BE8]' : 'border-slate-200',
                data.selectable ? 'cursor-pointer' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSelect(index)}
            >
              <div className={`${aspectClass} w-full relative bg-slate-100`}>
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.prompt ?? `Image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                    {image.prompt ?? `Image ${index + 1}`}
                  </div>
                )}

                {/* Selected checkmark overlay */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#3D8BE8] flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Prompt label */}
              {image.prompt && (
                <div className="px-2 py-1.5 bg-white">
                  <p className="text-xs text-slate-600 truncate">{image.prompt}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
