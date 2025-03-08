import { NextResponse } from "next/server"
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const COUNTER_FILE = path.join(DATA_DIR, 'maps-counter.json')

interface CounterData {
  count: number
  lastResetDate: string
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

function isNewDay(lastResetDate: string): boolean {
  const last = new Date(lastResetDate)
  const now = new Date()
  return last.toDateString() !== now.toDateString()
}

async function getCounter(): Promise<CounterData> {
  await ensureDataDir()
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf8')
    const counterData: CounterData = JSON.parse(data)
    
    // Reset counter if it's a new day
    if (isNewDay(counterData.lastResetDate)) {
      const resetData: CounterData = {
        count: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      }
      await fs.writeFile(COUNTER_FILE, JSON.stringify(resetData))
      return resetData
    }
    
    return counterData
  } catch (error) {
    // Initialize counter file if it doesn't exist
    const initialData: CounterData = {
      count: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    }
    await fs.writeFile(COUNTER_FILE, JSON.stringify(initialData))
    return initialData
  }
}

async function incrementCounter(): Promise<number> {
  const counterData = await getCounter()
  const newCount = counterData.count + 1
  await fs.writeFile(COUNTER_FILE, JSON.stringify({
    count: newCount,
    lastResetDate: counterData.lastResetDate
  }))
  return newCount
}

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

    const requestCount = await incrementCounter()
    
    if (requestCount >= 9900) {
      return NextResponse.json(
        { 
          error: "Map embedding is temporarily unavailable due to API limits",
          requestCount,
          limitReached: true
        },
        { status: 429 }
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

    return NextResponse.json({ 
      mapUrl: embeddedMapUrl,
      requestCount
    })

  } catch (error) {
    console.error("Error generating map URL:", error)
    return NextResponse.json(
      { error: "Failed to generate map URL" },
      { status: 500 }
    )
  }
}