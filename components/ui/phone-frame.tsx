"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface PhoneFrameProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
}

export function PhoneFrame({ children, className, title, icon }: PhoneFrameProps) {
  return (
    <div className={cn("relative mx-auto", className)}>
      <div className="relative mx-auto w-[280px] h-[580px] bg-white rounded-[40px] shadow-xl overflow-hidden border-8 border-white">
        {/* Phone notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-white z-20 flex justify-center">
          <div className="w-40 h-6 bg-black rounded-b-xl"></div>
        </div>

        {/* Header with platform icon and title */}
        <div className="absolute top-6 inset-x-0 h-12 bg-gray-100 flex items-center px-4 z-10">
          {icon && <div className="mr-2">{icon}</div>}
          {title && <div className="font-medium text-gray-800">{title}</div>}
        </div>

        {/* Content area */}
        <div className="absolute top-[72px] inset-x-0 bottom-0 overflow-y-auto bg-gray-50">{children}</div>
      </div>
    </div>
  )
}
