"use client"

import { useState } from "react"
import { Users, Plus, Filter, Search, Edit, Trash, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function AudienceGroupManager() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock audience groups
  const audienceGroups = [
    {
      id: 1,
      name: "Primary Audience",
      description: "Yoga enthusiasts aged 25-45 in urban areas",
      size: 12500,
      channels: ["All"],
      active: true,
    },
    {
      id: 2,
      name: "Previous Attendees",
      description: "People who have attended Art of Living events in the past 2 years",
      size: 3200,
      channels: ["Email", "SMS"],
      active: true,
    },
    {
      id: 3,
      name: "Corporate Professionals",
      description: "Professionals in high-stress environments seeking stress-relief",
      size: 8700,
      channels: ["LinkedIn", "Email"],
      active: false,
    },
    {
      id: 4,
      name: "Yoga Teachers",
      description: "Certified yoga teachers and instructors",
      size: 1500,
      channels: ["Email", "Facebook"],
      active: true,
    },
  ]

  // Filter audience groups based on search query
  const filteredGroups = audienceGroups.filter((group) => {
    return (
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Audience Groups
          </CardTitle>
          <CardDescription>Manage your audience segments for targeted messaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search audience groups..."
                className="w-full pl-10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Audience Group
            </Button>
          </div>

          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.id} className="p-4 border border-border/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{group.name}</h3>
                    {group.active ? (
                      <Badge variant="success" className="text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{group.description}</p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{group.size.toLocaleString()} members</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span>Channels: {group.channels.join(", ")}</span>
                  </div>

                  {group.active && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span>Used in this campaign</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No audience groups found</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  We couldn't find any audience groups matching your search criteria.
                </p>
                <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Audience Filters
          </CardTitle>
          <CardDescription>Create dynamic audience segments with filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Create Dynamic Audience Filters</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Use filters to create dynamic audience segments based on demographics, behavior, and engagement.
            </p>
            <Button>Create Filter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
