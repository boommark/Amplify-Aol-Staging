'use client'

interface Chip {
  label: string
  prompt: string
}

interface ActionChipsProps {
  chips: Chip[]
  onSelect: (prompt: string) => void
  // Creative studio props for flavor-switch chips (ADS-07)
  hasCreatives?: boolean
  selectedFlavor?: 'warm' | 'playful'
  pipelineStage?: string
  onTriggerAdCreativeGeneration?: (flavor: 'warm' | 'playful') => void
}

export function ActionChips({
  chips,
  onSelect,
  hasCreatives,
  selectedFlavor,
  pipelineStage,
  onTriggerAdCreativeGeneration,
}: ActionChipsProps) {
  const isGenerating = pipelineStage === 'ad_creative'

  const flavorSwitchChip =
    hasCreatives && selectedFlavor && onTriggerAdCreativeGeneration
      ? selectedFlavor === 'warm'
        ? { label: 'Switch to Playful Concept', flavor: 'playful' as const }
        : { label: 'Switch to Warm Realism', flavor: 'warm' as const }
      : null

  const hasChips = (chips && chips.length > 0) || flavorSwitchChip !== null
  if (!hasChips) return null

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
      {flavorSwitchChip && (
        <button
          type="button"
          onClick={() => !isGenerating && onTriggerAdCreativeGeneration!(flavorSwitchChip.flavor)}
          disabled={isGenerating}
          className={
            'bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-[#3D8BE8] hover:text-[#3D8BE8] transition-colors duration-200 ease-in-out' +
            (isGenerating ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
          }
        >
          {flavorSwitchChip.label}
        </button>
      )}
    </div>
  )
}
