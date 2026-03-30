'use client'

interface SkeletonPartProps {
  type: 'text' | 'card' | 'image'
}

export function SkeletonPart({ type }: SkeletonPartProps) {
  if (type === 'text') {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-[#F3F4F6] rounded w-full" />
        <div className="h-4 bg-[#F3F4F6] rounded w-4/5" />
        <div className="h-4 bg-[#F3F4F6] rounded w-3/5" />
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className="h-[120px] bg-[#F3F4F6] rounded-xl animate-pulse" />
    )
  }

  // image
  return (
    <div className="h-[200px] bg-[#F3F4F6] rounded-xl animate-pulse" />
  )
}
