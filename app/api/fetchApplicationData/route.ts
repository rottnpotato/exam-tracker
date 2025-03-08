import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { id } = await request.json()

  const boundary = "----WebKitFormBoundaryvbRQ04Ex8huHVs2h"
  const body = `--${boundary}\r\nContent-Disposition: form-data; name="data"\r\n\r\n{"application":{"id":${id}}}\r\n--${boundary}--\r\n`

  try {
    const response = await fetch("https://eas.bisu.edu.ph/api/client/trackapplication", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch data")
    }

    const data = await response.json()

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching application data:", error)
    return NextResponse.json({ error: "An error occurred while fetching the data" }, { status: 500 })
  }
}

