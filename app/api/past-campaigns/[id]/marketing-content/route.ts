import { NextResponse } from "next/server"
import Airtable from "airtable"

// Configure Airtable
Airtable.configure({
  apiKey:
    process.env.AIRTABLE_API_KEY ||
    "AIRTABLE_KEY_REDACTED",
})

const baseId = process.env.AIRTABLE_BASE_ID || "appKWaroUUwxM6m2f"
const tableName = "Introductory Workshops" // This is the table that contains the marketing content

const base = Airtable.base(baseId)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Fetching marketing content for campaign with ID: ${id} from Airtable...`)

    // Fetch the specific record by ID
    const record = await base(tableName).find(id)

    if (!record) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Log all available fields for debugging
    console.log("Available fields in Airtable record:", Object.keys(record.fields))

    // Extract the fields we need for the campaign name
    const fields = record.fields
    const region = fields.Region || ""
    const courseType = fields.CourseType || ""

    // Create the campaign name by combining Region and CourseType
    const campaignName = `${region} ${courseType}`.trim() || "Untitled Campaign"

    // Get the image URL from the 'IMG - Topic 1 WhatsApp' column
    let imageUrl = "/placeholder.svg?height=200&width=400"
    if (
      fields["IMG - Topic 1 WhatsApp"] &&
      Array.isArray(fields["IMG - Topic 1 WhatsApp"]) &&
      fields["IMG - Topic 1 WhatsApp"].length > 0
    ) {
      imageUrl = fields["IMG - Topic 1 WhatsApp"][0].url
    }

    // Helper function to get image URL
    const getImageUrl = (fieldName: string) => {
      if (fields[fieldName] && Array.isArray(fields[fieldName]) && fields[fieldName].length > 0) {
        return fields[fieldName][0].url
      }
      return "/placeholder.svg?height=400&width=400"
    }

    // Map the Airtable fields to our Marketing Content structure
    const marketingContent = {
      id: record.id,
      name: campaignName,
      course: fields.Course || "No Course Specified",
      date: fields["Course Date"] || "No Date Specified",
      location: fields.Region || "No Location Specified",
      audience: fields.Audience || fields["Target Group"] || "No Audience Specified",
      imageUrl: imageUrl,

      // Topic captions
      topic1: fields["Topic 1"] || "Topic 1",
      topic2: fields["Topic 2"] || "Topic 2",
      topic3: fields["Topic 3"] || "Topic 3",

      // Topic 1 content
      topic1WhatsAppImage: getImageUrl("IMG - Topic 1 WhatsApp"),
      topic1WhatsAppMessage: fields["Topic 1 WhatsApp Message"] || "",
      topic1FacebookImage: getImageUrl("IMG - Topic 1 Facebook"),
      topic1FacebookPost: fields["Topic 1 Facebook Post"] || "",
      topic1InstagramImage: getImageUrl("IMG - Topic 1 Instagram"),
      topic1InstagramPost: fields["Topic 1 Instagram Post"] || "",
      topic1EmailImage: getImageUrl("IMG - Topic 1 Email"),
      topic1Email: fields["Topic 1 Email"] || "",

      // Topic 2 content
      topic2WhatsAppImage: getImageUrl("IMG - Topic 2 WhatsApp"),
      topic2WhatsAppMessage: fields["Topic 2 WhatsApp Message"] || "",
      topic2FacebookImage: getImageUrl("IMG - Topic 2 Facebook"),
      topic2FacebookPost: fields["Topic 2 Facebook Post"] || "",
      topic2InstagramImage: getImageUrl("IMG - Topic 2 WhatsApp"),
      topic2InstagramPost: fields["Topic 2 Instagram Post"] || "",
      topic2EmailImage: getImageUrl("IMG - Topic 2 Email Banner"),
      topic2Email: fields["Topic 2 Email"] || "",

      // Topic 3 content
      topic3WhatsAppImage: getImageUrl("IMG - Topic 3 WhatsApp"),
      topic3WhatsAppMessage: fields["Topic 3 WhatsApp Message"] || "",
      topic3FacebookImage: getImageUrl("IMG - Topic 3 Facebook"),
      topic3FacebookPost: fields["Topic 3 Facebook Post"] || "",
      topic3InstagramImage: getImageUrl("IMG - Topic 3 Instagram"),
      topic3InstagramPost: fields["Topic 3 Instagram Post"] || "",
      topic3EmailImage: getImageUrl("IMG - Topic 3 Email Banner"),
      topic3Email: fields["Topic 3 Email"] || "",

      // Include all raw fields for debugging
      rawFields: fields,
    }

    console.log("Mapped marketing content:", marketingContent)
    return NextResponse.json(marketingContent)
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
