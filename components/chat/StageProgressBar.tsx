'use client'

import { CheckCircle2 } from 'lucide-react'

interface Stage {
  id: string
  label: string
  state: 'pending' | 'active' | 'completed'
}

interface StageProgressBarProps {
  stages: Stage[]
}

export function StageProgressBar({ stages }: StageProgressBarProps) {
  return (
    <div className="pt-6 px-2">
      <ol role="list" className="flex items-center w-full">
        {stages.map((stage, index) => (
          <li key={stage.id} className="flex items-center flex-1 last:flex-none">
            {/* Step indicator */}
            <div className="flex flex-col items-center gap-1">
              {stage.state === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" aria-hidden="true" />
              )}
              {stage.state === 'active' && (
                <div
                  className="w-5 h-5 rounded-full bg-[#3D8BE8]"
                  aria-current="step"
                  aria-hidden="true"
                />
              )}
              {stage.state === 'pending' && (
                <div
                  className="w-5 h-5 rounded-full bg-slate-200"
                  aria-hidden="true"
                />
              )}

              {/* Step label */}
              <span
                className={[
                  'hidden sm:block text-xs',
                  stage.state === 'completed'
                    ? 'text-slate-700 font-medium'
                    : stage.state === 'active'
                      ? 'text-[#3D8BE8] font-semibold'
                      : 'text-slate-400',
                ].join(' ')}
              >
                {stage.label}
              </span>
              {/* On mobile, only show label for active step */}
              {stage.state === 'active' && (
                <span className="sm:hidden text-xs text-[#3D8BE8] font-semibold">
                  {stage.label}
                </span>
              )}
            </div>

            {/* Connecting line between steps */}
            {index < stages.length - 1 && (
              <div
                className={[
                  'flex-1 h-0.5 mx-2',
                  stage.state === 'completed' ? 'bg-[#22C55E]' : 'bg-slate-200',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
