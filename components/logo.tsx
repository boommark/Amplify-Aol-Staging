import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
}

export function Logo({ className = "", showText = true, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textColorClasses = {
    default: "text-foreground",
    white: "text-white",
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <Image
          src="/images/amplify-logo-v4.png"
          alt="Amplify Logo"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
      </div>
      {showText && <span className={cn("ml-2 font-bold text-xl", textColorClasses[variant])}>Amplify</span>}
    </div>
  )
}

export function LogoWithText({ className = "", size = "md", variant = "default" }: Omit<LogoProps, "showText">) {
  return <Logo className={className} showText={true} size={size} variant={variant} />
}
