import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
}

export function Logo({ className = "", showText = false, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textColorClasses = {
    default: "text-foreground",
    white: "text-white",
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-C9yhlg7fWdvaXe2WwGJmWRYqJsUMPx.png"
          alt="Amplify Logo"
          width={32}
          height={32}
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
