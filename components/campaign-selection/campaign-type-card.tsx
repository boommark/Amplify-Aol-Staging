"use client"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Sparkles, Clock } from "lucide-react"
import { useState } from "react"

interface CampaignTypeCardProps {
  campaign: {
    id: string
    title: string
    description: string
    icon: LucideIcon
    colorClass?: string
    comingSoon?: boolean
  }
  selected: boolean
  onSelect: () => void
  index: number
}

export function CampaignTypeCard({ campaign, selected, onSelect, index }: CampaignTypeCardProps) {
  const Icon = campaign.icon
  const [isHovered, setIsHovered] = useState(false)
  const isComingSoon = campaign.comingSoon || false
  const isDisabled = isComingSoon

  // Default color classes if none provided
  const colorClasses = {
    "intro-workshop": "from-blue-500 to-blue-600",
    "gurudev-tour": "from-purple-500 to-purple-600",
    "special-event": "from-pink-500 to-pink-600",
    "national-campaign": "from-indigo-500 to-indigo-600",
    "state-campaign": "from-cyan-500 to-cyan-600",
    "city-campaign": "from-teal-500 to-teal-600",
    "special-event-local": "from-amber-500 to-amber-600",
    "graduate-workshop": "from-green-500 to-green-600",
  }

  const cardColorClass = colorClasses[campaign.id as keyof typeof colorClasses] || "from-blue-500 to-blue-600"

  // Animation delay based on index
  const animationDelay = `${index * 0.05}s`

  const handleClick = () => {
    if (!isDisabled) {
      onSelect()
    }
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer items-start gap-4 rounded-2xl border bg-white p-5 transition-all duration-300 hover:border-primary-300 hover:shadow-lg md:gap-8 animate-fadeIn",
        selected ? "border-primary shadow-md ring-2 ring-primary" : "border-muted",
        isHovered && !isDisabled ? "transform scale-[1.02]" : "",
        isDisabled ? "opacity-70 cursor-not-allowed" : "",
      )}
      style={{ animationDelay }}
      onClick={handleClick}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => !isDisabled && setIsHovered(false)}
      role="button"
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
    >
      {/* Colored accent bar on the left */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b transition-all duration-300",
          isDisabled && campaign.id !== "national-campaign" ? "from-gray-400 to-gray-500" : cardColorClass,
          isHovered || selected ? "w-2" : "w-1",
        )}
      />

      <div
        className={cn(
          "z-10 flex h-14 w-14 items-center justify-center rounded-xl text-white md:h-16 md:w-16 transition-all duration-500 bg-gradient-to-br",
          isDisabled && campaign.id !== "national-campaign" ? "from-gray-400 to-gray-500" : cardColorClass,
          selected ? "shadow-glow" : "",
          isHovered && !isDisabled ? "shadow-lg" : "",
        )}
      >
        <Icon className={cn("h-7 w-7 transition-all duration-300", isHovered && !isDisabled ? "scale-110" : "")} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-medium md:text-xl text-secondary-800">{campaign.title}</h3>
          {isComingSoon && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              <Clock className="mr-1 h-3 w-3" />
              Coming Soon
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{campaign.description}</p>
      </div>

      {/* Sparkles icon that appears on hover */}
      {!isDisabled && (
        <div
          className={cn(
            "absolute right-4 top-4 transition-all duration-300",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50",
          )}
        >
          <Sparkles
            className={cn(
              "h-5 w-5 transition-all duration-300",
              cardColorClass.includes("blue")
                ? "text-blue-500"
                : cardColorClass.includes("purple")
                  ? "text-purple-500"
                  : cardColorClass.includes("pink")
                    ? "text-pink-500"
                    : cardColorClass.includes("indigo")
                      ? "text-indigo-500"
                      : cardColorClass.includes("cyan")
                        ? "text-cyan-500"
                        : cardColorClass.includes("teal")
                          ? "text-teal-500"
                          : cardColorClass.includes("amber")
                            ? "text-amber-500"
                            : "text-green-500",
            )}
          />
        </div>
      )}

      <div className="ml-2 flex h-6 w-6 items-center justify-center">
        <div
          className={cn(
            "h-6 w-6 rounded-full border-2 transition-all duration-300",
            selected ? `border-4 border-primary bg-primary-100` : "border-muted",
            isHovered && !selected && !isDisabled ? "border-gray-400" : "",
            isDisabled ? "opacity-50" : "",
          )}
        />
      </div>
    </div>
  )
}
