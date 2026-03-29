import { NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_AD_CAMPAIGNS_TABLE_ID!

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Connect to Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Product: body.product,
          AdOrientation: body.adOrientation,
          Color: body.color,
          AdType: body.adType,
          Status: "Pending",
          CreatedAt: new Date().toISOString(),
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Airtable API error (${response.status}): ${errorText}`)
      return NextResponse.json({ error: "Failed to create record in Airtable" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json({ success: true, recordId: data.id })
  } catch (error) {
    console.error("Error creating ad brief:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
