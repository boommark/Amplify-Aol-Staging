import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Amplify Marketing Suite",
  description: "Amplify Marketing Suite Dashboard",
}

export default function DashboardPage() {
  redirect("/dashboard/campaign-options")
}
