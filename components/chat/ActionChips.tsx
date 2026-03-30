'use client'

interface Chip {
  label: string
  prompt: string
}

interface ActionChipsProps {
  chips: Chip[]
  onSelect: (prompt: string) => void
}

export function ActionChips({ chips, onSelect }: ActionChipsProps) {
  if (!chips || chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {chips.map((chip, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(chip.prompt)}
          className="bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-[#3D8BE8] hover:text-[#3D8BE8] transition-colors duration-200 ease-in-out cursor-pointer"
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
