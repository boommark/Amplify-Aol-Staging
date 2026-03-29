import type React from 'react'

// Auth route group layout — no authentication required
// Pages: /login, /auth/callback
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
