'use client'

interface FlavorPickerProps {
  selected: 'warm' | 'playful'
  onChange: (flavor: 'warm' | 'playful') => void
  disabled?: boolean
}

export function FlavorPicker({ selected, onChange, disabled }: FlavorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-500">Choose a creative direction for your ad images</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => !disabled && onChange('warm')}
          disabled={disabled}
          className={
            selected === 'warm'
              ? 'bg-[#3D8BE8] text-white font-medium rounded-full px-4 py-2 text-sm' +
                (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
              : 'bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-2 text-sm hover:bg-slate-50' +
                (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
          }
        >
          Warm Realism
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange('playful')}
          disabled={disabled}
          className={
            selected === 'playful'
              ? 'bg-[#3D8BE8] text-white font-medium rounded-full px-4 py-2 text-sm' +
                (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
              : 'bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-2 text-sm hover:bg-slate-50' +
                (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
          }
        >
          Playful Concept
        </button>
      </div>
    </div>
  )
}
