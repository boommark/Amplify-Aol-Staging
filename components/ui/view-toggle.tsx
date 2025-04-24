"use client"
import { cn } from "@/lib/utils"
import { Monitor, Smartphone } from "lucide-react"

interface ViewToggleProps {
  value: "mobile" | "desktop"
  onChange: (value: "mobile" | "desktop") => void
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center justify-center p-2 bg-white rounded-full shadow-md", className)}>
      <button
        onClick={() => onChange("mobile")}
        className={cn(
          "flex items-center justify-center p-2 rounded-l-full transition-colors",
          value === "mobile" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        )}
        aria-pressed={value === "mobile"}
      >
        <Smartphone className="w-5 h-5" />
        <span className="ml-2 font-medium">Mobile</span>
      </button>
      <button
        onClick={() => onChange("desktop")}
        className={cn(
          "flex items-center justify-center p-2 rounded-r-full transition-colors",
          value === "desktop" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        )}
        aria-pressed={value === "desktop"}
      >
        <Monitor className="w-5 h-5" />
        <span className="ml-2 font-medium">Desktop</span>
      </button>
    </div>
  )
}
