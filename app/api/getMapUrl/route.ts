import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const venueName = searchParams.get("venue")

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Maps API key is not configured" },
        { status: 500 }
      )
    }

    // Create an embedded map URL that includes the place name if provided
    const query = venueName ? encodeURIComponent(venueName) : `${lat},${lng}`
    const embeddedMapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&center=${lat},${lng}&zoom=15`

    return NextResponse.json({ mapUrl: embeddedMapUrl })
  } catch (error) {
    console.error("Error generating map URL:", error)
    return NextResponse.json(
      { error: "Failed to generate map URL" },
      { status: 500 }
    )
  }
}