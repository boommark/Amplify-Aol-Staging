import { NextResponse } from "next/server"
import Airtable from "airtable"

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY!,
})

const baseId = process.env.AIRTABLE_BASE_ID!
const tableName = "Introductory Workshops"

const base = Airtable.base(baseId)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Fetching campaign with ID: ${id} from Airtable...`)

    // Fetch the specific record by ID
    const record = await base(tableName).find(id)

    if (!record) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Log all available fields for debugging
    console.log("Available fields in Airtable record:", Object.keys(record.fields))

    console.log("Raw record fields:", record.fields)

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

    // Get the spirituality field content - use the correct field name
    const spiritualityContent = fields["Spirituality Research"] || ""

    // Map the Airtable fields to our Campaign structure with exact field names
    const campaign = {
      id: record.id,
      name: campaignName,
      course: fields.Course || "No Course Specified",
      date: fields["Course Date"] || "No Date Specified",
      location: fields.Region || "No Location Specified",
      audience: fields.Audience || fields["Target Group"] || "No Audience Specified",
      imageUrl: imageUrl,

      // Research fields - using exact field names from Airtable
      spiritualityAndMeditationResearch: spiritualityContent,
      mentalHealthResearch: fields["Mental Health Research"] || "",
      sleepAndPhysicalHealthResearch: fields["Sleep and Physical Health Research"] || "",
      relationshipsResearch: fields["Relationships Research"] || "",

      // Messaging guidelines fields - using exact field names from Airtable
      localIdioms: fields["Local Idioms"] || "",
      copywritingIdeas: fields["Copywriting Guidelines"] || "", // Note: Maps to "Copywriting Guidelines" in Airtable
      seasonalGuidance: fields["Seasonal Guidance"] || "",

      // Include all raw fields for debugging
      rawFields: fields,
    }

    console.log("Mapped campaign:", campaign)
    return NextResponse.json(campaign)
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
