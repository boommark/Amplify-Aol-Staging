"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface DesktopFrameProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
}

export function DesktopFrame({ children, className, title, icon }: DesktopFrameProps) {
  return (
    <div className={cn("relative mx-auto", className)}>
      <div className="relative mx-auto w-full max-w-[800px] bg-gray-200 rounded-lg shadow-xl overflow-hidden">
        {/* MacOS-like top bar */}
        <div className="h-6 bg-gray-300 flex items-center px-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {title && (
            <div className="absolute inset-x-0 text-center text-sm font-medium text-gray-700">
              {icon && <span className="mr-1">{icon}</span>}
              {title}
            </div>
          )}
        </div>

        {/* Browser-like address bar */}
        <div className="h-8 bg-gray-100 border-b border-gray-300 flex items-center px-4">
          <div className="w-full h-6 bg-white rounded-md flex items-center px-2 text-xs text-gray-500 overflow-hidden">
            {icon && <span className="mr-1">{icon}</span>}
            {title && `${title.toLowerCase().replace(/\s+/g, "")}.com`}
          </div>
        </div>

        {/* Content area */}
        <div className="h-[500px] overflow-y-auto bg-white">{children}</div>
      </div>
    </div>
  )
}
