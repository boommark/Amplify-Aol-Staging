import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get query parameters from the URL
    const url = new URL(request.url)
    const airtable_rec_id = url.searchParams.get("airtable_rec_id")
    const field_name = url.searchParams.get("field_name")
    const updated_value = url.searchParams.get("updated_value")

    if (!airtable_rec_id || !field_name || updated_value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Webhook URL
    const webhookUrl = "https://boommk.app.n8n.cloud/webhook/86972ed5-4d8f-4088-b007-7bce339f4c3e"

    // Format the query parameters
    const queryParams = new URLSearchParams({
      airtable_rec_id,
      field_name,
      updated_value,
    }).toString()

    console.log(`Calling webhook: ${webhookUrl}?${queryParams}`)

    // Make the GET request with query parameters
    const webhookResponse = await fetch(`${webhookUrl}?${queryParams}`, {
      method: "GET",
    })

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`)
      // Try to get more details about the error
      let errorDetails = ""
      try {
        const errorText = await webhookResponse.text()
        errorDetails = errorText
      } catch (e) {
        errorDetails = "Could not retrieve error details"
      }
      console.error("Error details:", errorDetails)

      throw new Error(`Webhook responded with status: ${webhookResponse.status}`)
    }

    // For successful responses, try to parse JSON but don't fail if it's not JSON
    let webhookData
    try {
      webhookData = await webhookResponse.json()
    } catch (e) {
      // If it's not JSON, just use the text
      const text = await webhookResponse.text()
      webhookData = { message: "Success", response: text }
    }

    return NextResponse.json(webhookData)
  } catch (error) {
    console.error("Error calling webhook:", error)
    return NextResponse.json({ error: "Failed to call webhook", details: error.message }, { status: 500 })
  }
}
