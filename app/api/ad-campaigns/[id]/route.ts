import { NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!
const AD_CAMPAIGNS_TABLE_ID = process.env.AIRTABLE_AD_CAMPAIGNS_TABLE_ID!

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const recordId = params.id

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    console.log(`Fetching ad campaign data for record ID: ${recordId}`)

    // Construct the URL to fetch a specific record
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AD_CAMPAIGNS_TABLE_ID}/${recordId}`

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

    const record = await response.json()

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Safely access fields with fallbacks
    const fields = record.fields || {}

    const campaignData = {
      id: record.id,
      headline: fields["Headline"] || "",
      subheadline: fields["Subheadline"] || "",
      bodyCopy: fields["Body Copy"] || "",
      buttonText: fields["ButtonText"] || "Learn More", // Fixed: "ButtonText" instead of "Button Text"
      prompt: fields["Prompt"] || "", // Confirmed: Using "Prompt" as the column name
      rawImageUrl: fields["RawImage URL"] || "",
      creativeUrl: fields["Creative URL"] || "",
    }

    return NextResponse.json(campaignData)
  } catch (error) {
    console.error("Error fetching ad campaign data:", error)
    return NextResponse.json({ error: "Failed to fetch ad campaign data" }, { status: 500 })
  }
}
