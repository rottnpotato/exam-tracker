import type { ProcessedData, RejectedData } from "@/types"
import { getExamStatus, getDateStatus, extractPostponedDate } from "@/utils/date-utils"
import { searchVenue } from "./venue-service"

interface ScheduleItem {
  "Application ID": string | number
  Date: string
  Time: string
  Course: string
  Postponed?: string
}

interface ApplicationData {
  id: number
  first_name: string
  last_name: string
  coursecode?: string
  exam_venue?: string
  // Add other application data fields as needed
}

// Cache for schedule data to avoid excessive API calls
let cachedScheduleData: ScheduleItem[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export async function fetchApplicationById(id: string): Promise<ProcessedData | null> {
  try {
    // First try the regular application endpoint
    const response = await fetch("/api/fetchApplicationData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      cache: "no-store",
    })
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    // Check if the data is valid (id is not 0)
    if (data.id === 0) {
      return null
    }

    // Get the latest schedule data
    const scheduleData = await getScheduleData()
    return processApplicationData(data, id, scheduleData)
  } catch (error) {
    console.error("Error fetching application data:", error)
    return null
  }
}

/**
 * Fetches rejected application data by ID
 * @param id Application ID
 * @returns Promise with rejected data or null
 */
export async function fetchRejectedApplicationById(id: string): Promise<RejectedData | null> {
  try {
    const response = await fetch("/api/fetchRejectedApplication", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      cache: "no-store",
    })
    if (!response.ok) {
      return null
    }
    const rejectedData = await response.json()
    if (rejectedData && rejectedData.id !== 0) {
      return {
        ...rejectedData,
        id: String(rejectedData.id),
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching rejected application:", error)
    return null
  }
}

/**
 * Gets the latest schedule data with caching
 * @returns Promise with the latest schedule data
 */
async function getScheduleData(): Promise<ScheduleItem[]> {
  const now = Date.now()
  
  // Return cached data if it's still valid
  if (cachedScheduleData && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedScheduleData
  }
  
  // Otherwise fetch new data
  try {
    const data = await fetchLatestScheduleData()
    cachedScheduleData = data
    lastFetchTime = now
    console.log("Fetched latest schedule data:", data)
    return data
  } catch (error) {
    // If fetch fails and we have cached data, return that as fallback
    if (cachedScheduleData) {
      console.warn("Failed to fetch latest schedule data, using cached data")
      return cachedScheduleData
    }
    throw error
  }
}

/**
 * Fetches fresh schedule data from Google Sheets
 * @returns Promise with the latest schedule data
 */
export async function fetchLatestScheduleData() {
  try {
    const response = await fetch("/api/fetchSheetData", {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error("Failed to fetch latest schedule data")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching latest schedule data:", error)
    throw error
  }
}

/**
 * Processes raw application data with schedule information
 * @param data Raw application data
 * @param id Application ID
 * @param scheduleData Dynamic schedule data from Google Sheets
 * @returns Processed application data
 */
export function processApplicationData(
  data: ApplicationData, 
  id: string, 
  scheduleData: ScheduleItem[]
): ProcessedData {
  // Find the schedule from the dynamic data
  const schedule = scheduleData.find((s) => s["Application ID"].toString() === id)
  
  // Check if postponed - ensure boolean result
  const hasPostponedInfo = Boolean(schedule?.Postponed && schedule.Postponed.trim() !== "")
  
  // Extract postponed date if available
  const postponedDate = hasPostponedInfo && schedule?.Postponed ? 
    extractPostponedDate(schedule.Postponed) : 
    undefined
  
  // Get date and time
  const examDate = schedule?.Date || "N/A"
  const examTime = schedule?.Time || "N/A"
  
  // Check if the exam is today
  const isToday = examDate !== "N/A" && getDateStatus(examDate) === "today"
  
  // Create processed data
  const processedData: ProcessedData = {
    ...data,
    id: String(data.id),
    date: examDate,
    time: examTime,
    course: schedule?.Course || data.coursecode || "N/A",
    remarks: hasPostponedInfo && schedule?.Postponed ? schedule.Postponed : "N/A",
    isPostponed: hasPostponedInfo,
    postponedDate,
    isToday,
    dateStatus: "upcoming", // Default value, will be updated below
    exam_venue: data.exam_venue || "N/A" // Ensure exam_venue always has a value
  }
  
  // Add date status
  processedData.dateStatus = getExamStatus(examDate, examTime, hasPostponedInfo, postponedDate)
  
  // Add venue location
  if (processedData.exam_venue && processedData.exam_venue !== "N/A") {
    const venue = searchVenue(processedData.exam_venue)
    if (venue) {
      processedData.venue_location = {
        lat: venue.lat,
        lng: venue.lng,
      }
    }
  }
  
  return processedData
}

/**
 * Clears the schedule data cache, forcing a fresh fetch on next request
 */
export function clearScheduleCache() {
  cachedScheduleData = null;
  lastFetchTime = 0;
}

