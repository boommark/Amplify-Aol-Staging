"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"

const levels = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
]

export function ExperienceLevelSelector() {
  const [level, setLevel] = useState(1)

  return (
    <div className="space-y-4">
      <Slider defaultValue={[level]} max={3} step={1} onValueChange={(value) => setLevel(value[0])} className="py-4" />
      <div className="flex justify-between text-xs text-gray-500">
        {levels.map((l) => (
          <div key={l.value} className={`${level >= l.value ? "font-medium text-primary" : ""}`}>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
