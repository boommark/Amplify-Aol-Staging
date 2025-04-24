import { NextResponse } from "next/server"
import Airtable from "airtable"

// Configure Airtable
Airtable.configure({
  apiKey: "AIRTABLE_KEY_REDACTED",
})

const baseId = "appKWaroUUwxM6m2f"
const tableName = "Introductory Workshops"

const base = Airtable.base(baseId)

export async function GET() {
  try {
    console.log("Fetching past campaigns from Airtable...")
    const records = await base(tableName).select().all()

    console.log(`Found ${records.length} records in Airtable`)

    // Log the first record to see all available fields
    if (records.length > 0) {
      console.log("First record fields:", records[0].fields)
    }

    const formattedRecords = records.map((record) => {
      // Get all fields from the record
      const fields = record.fields

      // Extract the fields we need for the campaign name
      const region = fields.Region || ""
      const courseType = fields.CourseType || ""

      // Create the campaign name by combining Region and CourseType
      const campaignName = `${region} ${courseType}`.trim() || "Untitled Campaign"

      // Get the image URL from the 'IMG - Topic 1 WhatsApp' column
      // Airtable stores attachments as an array of objects with url property
      let imageUrl = "/placeholder.svg?height=200&width=400"

      if (
        fields["IMG - Topic 1 WhatsApp"] &&
        Array.isArray(fields["IMG - Topic 1 WhatsApp"]) &&
        fields["IMG - Topic 1 WhatsApp"].length > 0
      ) {
        // Get the first attachment's URL
        imageUrl = fields["IMG - Topic 1 WhatsApp"][0].url
        console.log(`Found image URL for record ${record.id}:`, imageUrl)
      }

      // Map the Airtable fields to our Campaign structure
      // Using the specific field names from Airtable
      const campaign = {
        id: record.id,
        name: campaignName,
        course: fields.Course || "No Course Specified",
        date: fields["Course Date"] || "No Date Specified",
        location: fields.Region || "No Location Specified",
        audience: fields.Audience || fields["Target Group"] || "No Audience Specified",
        imageUrl: imageUrl,
      }

      console.log(`Mapped record ${record.id}:`, campaign)
      return campaign
    })

    console.log("Formatted campaigns:", formattedRecords)
    return NextResponse.json(formattedRecords)
  } catch (error: any) {
    console.error("Error fetching Airtable data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        message: error.message || "Unknown error",
        details: error.stack,
        statusCode: error.statusCode,
      },
      { status: error.statusCode || 500 },
    )
  }
}
