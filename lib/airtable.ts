// Airtable API service
import type { Campaign } from "@/types/campaign"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_KEY_REDACTED"
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appKWaroUUwxM6m2f"
const AIRTABLE_TABLE_ID = "tblH4qf3BzdLOaxzM"
const AIRTABLE_VIEW_ID = "viwOEPNQ2vCDe7e87"
const AIRTABLE_AD_CAMPAIGNS_TABLE_ID = "tblOHUmg1WabyGsZl"
const AIRTABLE_AD_CAMPAIGNS_VIEW_ID = "viwCjO3E5XHRz3okZ"

export async function fetchPastCampaigns(): Promise<Campaign[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?view=${AIRTABLE_VIEW_ID}`

    console.log("Fetching campaigns from Airtable...")

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching to always get fresh data
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Airtable API error (${response.status}): ${errorText}`)
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()

    // Log the raw data to see what fields are actually coming from Airtable
    console.log("Raw Airtable data:", JSON.stringify(data.records[0], null, 2))

    // Map Airtable records to our Campaign type
    return data.records.map((record: any) => {
      // Log each record to debug
      console.log(`Processing record: ${record.id}`, record.fields)

      return {
        id: record.id,
        name: record.fields.Name || "Untitled Campaign",
        course: record.fields.Course || "No Course Specified",
        date: record.fields.Date || "No Date Specified",
        location: record.fields.Location || "No Location Specified",
        audience: record.fields.Audience || "No Audience Specified",
        imageUrl: record.fields.ImageURL || "/placeholder.svg?height=200&width=400",
      }
    })
  } catch (error) {
    console.error("Error fetching campaigns from Airtable:", error)
    // Return empty array - the component will use placeholders
    return []
  }
}

export interface AdCampaign {
  id: string
  creativeUrl: string
}

export async function fetchAdCampaigns(): Promise<AdCampaign[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_AD_CAMPAIGNS_TABLE_ID}?view=${AIRTABLE_AD_CAMPAIGNS_VIEW_ID}`

    console.log("Fetching ad campaigns from Airtable...")

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching to always get fresh data
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Airtable API error (${response.status}): ${errorText}`)
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()

    // Log the raw data to see what fields are actually coming from Airtable
    console.log("Raw Ad Campaigns data:", JSON.stringify(data.records[0], null, 2))

    // Map Airtable records to our AdCampaign type
    return data.records.map((record: any) => {
      // Log each record to debug
      console.log(`Processing ad campaign record: ${record.id}`, record.fields)

      return {
        id: record.id,
        creativeUrl: record.fields["Creative URL"] || "/placeholder.svg?height=400&width=400",
      }
    })
  } catch (error) {
    console.error("Error fetching ad campaigns from Airtable:", error)
    // Return empty array
    return []
  }
}
