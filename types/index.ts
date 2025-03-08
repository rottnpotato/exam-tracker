export interface ProcessedData {
  id: string
  first_name: string
  last_name: string
  exam_venue: string
  date: string
  time: string
  course: string
  remarks: string
  isPostponed: boolean
  postponedDate?: string
  dateStatus: "past" | "today-past" | "upcoming" | "postponed-past" | "postponed-upcoming" | "today" | "future" 
  isToday: boolean
  venue_location?: { lat: number; lng: number }
  [key: string]: any
}

export interface RejectedData {
  id: string
  first_name: string
  last_name: string
  coursecode: string
  status: string
  status_remarks: string
  remarks: string
  [key: string]: any
}

export interface VenueLocation {
  name: string
  address: string
  lat: number
  lng: number
}

