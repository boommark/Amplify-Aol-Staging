"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Calendar, Globe, Megaphone, Presentation, Sparkles, Users, Zap } from "lucide-react"
import { CampaignTypeCard } from "./campaign-type-card"

export function CampaignSelection() {
  const router = useRouter()
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  const handleCampaignSelect = (campaignId: string, comingSoon: boolean) => {
    setSelectedCampaign(campaignId)

    // Only navigate if the campaign is not marked as coming soon
    if (!comingSoon) {
      if (campaignId === "intro-workshop") {
        router.push(`/dashboard/insight-studio?type=${campaignId}`)
      } else if (campaignId === "national-campaign") {
        router.push(`/dashboard/ad-brief`)
      } else if (campaignId === "india-marketing") {
        router.push(`/dashboard/ad-brief?type=${campaignId}`)
      }
    }
  }

  const campaignTypes = [
    {
      id: "intro-workshop",
      title: "Introductory Workshop",
      description: "Plan and promote a local introductory workshop",
      icon: BookOpen,
      comingSoon: false,
    },
    {
      id: "gurudev-tour",
      title: "Gurudev's Tour",
      description: "Multi-city, multi-event tour campaign for Gurudev Sri Sri Ravi Shankar",
      icon: Globe,
      comingSoon: true,
    },
    {
      id: "special-event",
      title: "Special Event with Gurudev",
      description: "Wisdom Series, Public Talk, or other special events with Gurudev",
      icon: Presentation,
      comingSoon: true,
    },
    {
      id: "national-campaign",
      title: "National Ad Campaign",
      description: "Create high impact ad creatives for all channels with proven ad templates.",
      icon: Megaphone,
      comingSoon: false,
    },
    {
      id: "india-marketing",
      title: "India Marketing",
      description: "National marketing programs in India.",
      icon: Globe,
      comingSoon: false,
    },
    {
      id: "state-campaign",
      title: "State Campaign",
      description: "State-specific programs with national guidelines",
      icon: Users,
      comingSoon: true,
    },
    {
      id: "city-campaign",
      title: "City Campaign",
      description: "City-focused events like Health Yoga Week, Farmers Market",
      icon: Calendar,
      comingSoon: true,
    },
    {
      id: "special-event-local",
      title: "Special Event",
      description: "One-off events and special programs",
      icon: Sparkles,
      comingSoon: true,
    },
    {
      id: "graduate-workshop",
      title: "Graduate Workshop",
      description: "Advanced workshops for Art of Living graduates",
      icon: Zap,
      comingSoon: true,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-secondary-800">Select Campaign Type</h1>
            <p className="mt-1 text-muted-foreground">
              Choose the type of campaign you want to create. Only Introductory Workshop is available now.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {campaignTypes.map((campaign, index) => (
              <CampaignTypeCard
                key={campaign.id}
                campaign={campaign}
                selected={selectedCampaign === campaign.id}
                onSelect={() => handleCampaignSelect(campaign.id, campaign.comingSoon)}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
