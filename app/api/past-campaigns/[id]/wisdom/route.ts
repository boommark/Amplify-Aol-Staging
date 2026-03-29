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
    console.log(`Fetching wisdom data for campaign with ID: ${id} from Airtable...`)

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

    // Map the Airtable fields to our Campaign structure with exact field names
    const wisdom = {
      id: record.id,
      name: campaignName,
      course: fields.Course || "No Course Specified",
      date: fields["Course Date"] || "No Date Specified",
      location: fields.Region || "No Location Specified",
      audience: fields.Audience || fields["Target Group"] || "No Audience Specified",
      imageUrl: imageUrl,

      // Topic captions
      topic1: fields["Topic 1"] || "Spirituality",
      topic2: fields["Topic 2"] || "Mindfulness",
      topic3: fields["Topic 3"] || "Wellness",

      // Topic 1 quotes
      shortQuote1: fields["Short Quote 1"] || "The greatest wealth is to live content with little.",
      mediumQuote1:
        fields["Medium Quote 1"] ||
        "When you are able to maintain your own highest standards of integrity regardless of what others may do, you are destined for greatness.",
      rawWisdom1:
        fields["Raw Wisdom 1"] ||
        "The purpose of meditation is to make our mind calm and peaceful. If our mind is peaceful, we will be free from worries and mental discomfort, and so we will experience true happiness.",

      // Topic 2 quotes
      shortQuote2: fields["Short Quote 2"] || "Happiness is not having what you want, but wanting what you have.",
      mediumQuote2:
        fields["Medium Quote 2"] ||
        "The greatest battles are the ones we fight within ourselves. Conquer your mind, and you will conquer the world.",
      rawWisdom2:
        fields["Raw Wisdom 2"] ||
        "Mindfulness is the aware, balanced acceptance of the present experience. It isn't more complicated than that. It is opening to or receiving the present moment, pleasant or unpleasant, just as it is, without either clinging to it or rejecting it.",

      // Topic 3 quotes
      shortQuote3: fields["Short Quote 3"] || "Health is the greatest gift, contentment the greatest wealth.",
      mediumQuote3:
        fields["Medium Quote 3"] ||
        "Take care of your body. It's the only place you have to live in. Your body is a temple, treat it with respect.",
      rawWisdom3:
        fields["Raw Wisdom 3"] ||
        "Wellness encompasses a healthy body, a sound mind, and a tranquil spirit. Enjoy the journey as you strive for wellness. The body and mind are not separate entities. What affects one affects the other.",

      // Include all raw fields for debugging
      rawFields: fields,
    }

    console.log("Mapped wisdom data:", wisdom)
    return NextResponse.json(wisdom)
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
