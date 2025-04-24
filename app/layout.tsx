import type React from "react"
import type { Metadata } from "next"
import Client from "./client"

export const metadata: Metadata = {
  title: "Amplify Marketing Suite",
  description: "Create, manage, and optimize your marketing campaigns with our AI-powered platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Client>{children}</Client>
}


import './globals.css'