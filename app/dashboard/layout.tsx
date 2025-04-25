import type React from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard/campaign-options" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/help" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Help
              </Link>
              <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Settings
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
