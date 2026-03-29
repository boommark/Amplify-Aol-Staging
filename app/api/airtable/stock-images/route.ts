import { NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!
const STOCK_IMAGES_TABLE_ID = process.env.AIRTABLE_STOCK_IMAGES_TABLE_ID!
const STOCK_IMAGES_VIEW_ID = process.env.AIRTABLE_STOCK_IMAGES_VIEW_ID!

export async function GET() {
  try {
    console.log("Fetching stock images from Airtable")

    // Construct the URL to fetch records from the stock images table
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${STOCK_IMAGES_TABLE_ID}?view=${STOCK_IMAGES_VIEW_ID}`

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
    console.log(`Fetched ${data.records.length} stock images`)

    // Transform the data to a more usable format
    const stockImages = data.records.map((record: any) => ({
      id: record.id,
      awsS3Url: record.fields["AWS S3 URL"] || "",
      name: record.fields["Name"] || "",
    }))

    return NextResponse.json(stockImages)
  } catch (error) {
    console.error("Error fetching stock images:", error)
    return NextResponse.json({ error: "Failed to fetch stock images" }, { status: 500 })
  }
}
