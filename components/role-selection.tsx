"use client"

import type React from "react"

import { useState } from "react"
import { Check, Users, User, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

type Role = {
  id: string
  name: string
  description: string
  icon: React.ElementType
}

const roles: Role[] = [
  {
    id: "national",
    name: "National Marketing Team",
    description: "Create and manage nationwide campaigns",
    icon: Users,
  },
  {
    id: "teacher",
    name: "Teacher/Volunteer",
    description: "Promote local workshops and events",
    icon: User,
  },
  {
    id: "state",
    name: "State-Level Team",
    description: "Adapt national campaigns to state contexts",
    icon: MapPin,
  },
]

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  return (
    <div className="grid gap-4">
      {roles.map((role) => (
        <div
          key={role.id}
          className={cn(
            "relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
            selectedRole === role.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
          )}
          onClick={() => setSelectedRole(role.id)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <role.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
            <p className="text-sm text-gray-500">{role.description}</p>
          </div>
          {selectedRole === role.id && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
