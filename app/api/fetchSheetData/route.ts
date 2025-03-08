import { NextResponse } from "next/server"
import { parse } from 'csv-parse/sync'

export const dynamic = "force-dynamic" // Ensure this is always dynamic and not cached

export async function GET() {
  try {
    // Google Sheets as CSV export URL - replace the last part with /export?format=csv
    const sheetId = "1Wth7iPJvwFZkvBfR9sGdjKpnLnfC5T93fqG7uICFfNg"
    const gid = "1262072827"
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    
    const response = await fetch(url, {
      cache: "no-store", // Ensure we always get fresh data
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch spreadsheet data")
    }

    const csvText = await response.text()
    
    // Parse CSV properly using csv-parse
    const rows: string[][] = parse(csvText, {
      columns: false,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    })

    const headers = rows[0]

    // Find column indices
    const idIndex = headers.findIndex((h: string) => h.trim().toLowerCase().includes("application id"))
    const campusIndex = headers.findIndex((h: string) => h.trim().toLowerCase().includes("campus applied"))
    const courseIndex = headers.findIndex((h: string) => h.trim().toLowerCase().includes("course"))
    const venueIndex = headers.findIndex((h: string) => h.trim().toLowerCase().includes("exam venue"))
    const dateIndex = headers.findIndex((h: string) => h.trim().toLowerCase().includes("date"))
    const timeIndex = headers.findIndex((h: string) => h.trim().toLowerCase().includes("time"))
    const postponedIndex = 7 // Column H (0-indexed)

    // Parse data rows, skipping header
    const scheduleData = rows
      .slice(1)
      .filter(
        (row: string[]) =>
          row.length >=
          Math.max(idIndex, campusIndex, courseIndex, venueIndex, dateIndex, timeIndex, postponedIndex) + 1,
      )
      .map((row: string[]) => ({
        "Application ID": row[idIndex].trim().replace(/^['"]+|['"]+$/g, ""),
        "Campus Applied": row[campusIndex].trim().replace(/^['"]+|['"]+$/g, ""),
        Course: row[courseIndex].trim().replace(/^['"]+|['"]+$/g, ""),
        "Exam Venue": row[venueIndex].trim().replace(/^['"]+|['"]+$/g, ""),
        Date: row[dateIndex].trim().replace(/^['"]+|['"]+$/g, ""),
        Time: row[timeIndex].trim().replace(/^['"]+|['"]+$/g, ""),
        Postponed: row[postponedIndex] ? row[postponedIndex].trim().replace(/^['"]+|['"]+$/g, "") : "",
      }))
      // console.log("scheduleData", NextResponse.json(scheduleData))
    return NextResponse.json(scheduleData)
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error)
    return NextResponse.json({ error: "Failed to fetch spreadsheet data" }, { status: 500 })
  }
}

