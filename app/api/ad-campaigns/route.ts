import { NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_KEY_REDACTED"
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appKWaroUUwxM6m2f"
const AD_CAMPAIGNS_TABLE_ID = "tblOHUmg1WabyGsZl"

export async function GET() {
  try {
    console.log("Fetching ad campaigns from Airtable")

    // Construct the URL to fetch records from the Ad Campaigns table
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AD_CAMPAIGNS_TABLE_ID}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Airtable API error (${response.status}): ${errorText}`)
      return NextResponse.json({ error: `Airtable API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    if (!data || !data.records) {
      console.error("Invalid data format received from Airtable:", data)
      return NextResponse.json({ error: "Invalid data format received from Airtable" }, { status: 500 })
    }

    console.log(`Fetched ${data.records.length} ad campaigns`)

    // Map the Airtable records to our desired format
    const campaigns = data.records.map((record: any) => {
      // Safely access fields with fallbacks
      const fields = record.fields || {}

      return {
        id: record.id,
        headline: fields["Headline"] || "Untitled Campaign",
        subheadline: fields["Subheadline"] || "",
        creativeUrl: fields["Creative URL"] || "",
        buttonText: fields["ButtonText"] || "View Details", // Fixed: "ButtonText" instead of "Button Text"
      }
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching ad campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch ad campaigns" }, { status: 500 })
  }
}
