'use client'

interface FlyerFrameProps {
  content: string
}

export function FlyerFrame({ content }: FlyerFrameProps) {
  return (
    <div className="max-w-[350px] rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* Thick top bar */}
      <div className="bg-[#3D8BE8] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2">
        Flyer
      </div>
      {/* Body */}
      <div className="p-4 text-center">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  )
}
