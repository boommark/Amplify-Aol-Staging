import { NextResponse } from "next/server"
import Airtable from "airtable"

// Configure Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_KEY_REDACTED"
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appKWaroUUwxM6m2f"
const AIRTABLE_TABLE_ID = "tblOHUmg1WabyGsZl"

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
})

const base = Airtable.base(AIRTABLE_BASE_ID)

// Field mapping between our app and Airtable
const fieldMapping: Record<string, string> = {
  headline: "Headline",
  subheadline: "Subheadline",
  bodyCopy: "Body Copy",
  imagePrompt: "Image Prompt",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recordId, field, value } = body

    if (!recordId || !field || value === undefined) {
      return NextResponse.json({ error: "Record ID, field, and value are required" }, { status: 400 })
    }

    // Map the field name to Airtable field name
    const airtableField = fieldMapping[field]

    if (!airtableField) {
      return NextResponse.json({ error: "Invalid field name" }, { status: 400 })
    }

    // Update the record in Airtable
    const updateData: Record<string, any> = {}
    updateData[airtableField] = value

    await base(AIRTABLE_TABLE_ID).update(recordId, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating ad copy:", error)
    return NextResponse.json({ error: "Failed to update ad copy" }, { status: 500 })
  }
}
