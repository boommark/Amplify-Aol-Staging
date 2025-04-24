import { NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_KEY_REDACTED"
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appKWaroUUwxM6m2f"
const AD_COPY_TABLE_ID = "tblOHUmg1WabyGsZl"

export async function GET(request: Request) {
  try {
    // Get the record ID from the query parameters
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get("recordId")

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    console.log(`Fetching ad copy data for record ID: ${recordId}`)

    // Construct the URL to fetch a specific record
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AD_COPY_TABLE_ID}/${recordId}`

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
    console.log("Raw Airtable record data:", JSON.stringify(data, null, 2))

    // Extract the fields from the record
    return NextResponse.json({
      id: data.id,
      headline: data.fields["Headline"] || "",
      subheadline: data.fields["Subheadline"] || "",
      bodyCopy: data.fields["Body Copy"] || "",
      buttonText: data.fields["ButtonText"] || "Learn More", // Fixed: "ButtonText" instead of "Button Text"
      rawImageUrl: data.fields["RawImage URL"] || "",
      creativeUrl: data.fields["Creative URL"] || "",
      prompt: data.fields["Prompt"] || "", // Added: "Prompt" field
    })
  } catch (error) {
    console.error("Error fetching ad copy data:", error)
    return NextResponse.json({ error: "Failed to fetch ad copy data" }, { status: 500 })
  }
}
