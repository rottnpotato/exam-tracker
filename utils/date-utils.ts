export function getExamStatus(
  dateStr: string,
  timeStr: string,
  isPostponed: boolean,
  postponedDateStr?: string,
): "past" | "today-past" | "upcoming" | "postponed-past" | "postponed-upcoming" {
  // If the exam is postponed, check the postponed date status
  if (isPostponed && postponedDateStr && postponedDateStr !== "N/A" && postponedDateStr !== "-") {
    const postponedDateStatus = getDateStatus(postponedDateStr)
    return postponedDateStatus === "past" ? "postponed-past" : "postponed-upcoming"
  }

  // If the exam is postponed but no new date, just mark as postponed-upcoming
  if (isPostponed) {
    return "postponed-upcoming"
  }

  // If the date is not available or invalid, default to "upcoming"
  if (dateStr === "N/A" || dateStr === "-") {
    return "upcoming"
  }

  // Check the date status
  const dateStatus = getDateStatus(dateStr)

  // If the date is in the past, the exam is past
  if (dateStatus === "past") {
    return "past"
  }

  // If the date is today, check the time
  if (dateStatus === "today") {
    const timeStatus = getTimeStatus(timeStr)
    // If the time has passed, mark as today-past (special case for today)
    return timeStatus === "past" ? "today-past" : "upcoming"
  }

  // If the date is in the future, the exam is upcoming
  return "upcoming"
}

export function getDateStatus(dateStr: string): "past" | "today" | "future" | "today-past" | "upcoming" | "postponed-past" | "postponed-upcoming" {
  if (!dateStr || dateStr === "N/A" || dateStr === "-") {
    return "future" // Default to future if no date
  }
  
  try {
    // Handle date format "Jan 24, 2025"
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthDayYearRegex = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/;
    const match = dateStr.match(monthDayYearRegex);
    
    if (match) {
      const monthIdx = monthNames.indexOf(match[1]);
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      if (monthIdx !== -1) {
        const examDate = new Date(year, monthIdx, day);
        examDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (examDate.getTime() < today.getTime()) {
          return "past";
        } else if (examDate.getTime() === today.getTime()) {
          return "today";
        } else {
          return "future";
        }
      }
    }
    
    // Try parsing as normal JS date if not in the specific format above
    const examDate = new Date(dateStr);
    
    // If valid date was parsed
    if (!isNaN(examDate.getTime())) {
      examDate.setHours(0, 0, 0, 0); // Reset time part
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part
      
      // Compare dates
      if (examDate.getTime() < today.getTime()) {
        return "past";
      } else if (examDate.getTime() === today.getTime()) {
        return "today";
      } else {
        return "future";
      }
    }
    
    // Try parsing as MM/DD/YYYY if the above methods failed
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const month = Number.parseInt(parts[0], 10) - 1; // Months are 0-indexed in JS
      const day = Number.parseInt(parts[1], 10);
      const year = Number.parseInt(parts[2], 10);
      
      const parsedDate = new Date(year, month, day);
      parsedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (parsedDate.getTime() < today.getTime()) {
        return "past";
      } else if (parsedDate.getTime() === today.getTime()) {
        return "today";
      } else {
        return "future";
      }
    }
    
    // Default to future if format doesn't match
    return "future";
  } catch (error) {
    console.error("Error parsing date:", error);
    return "future"; // Default to future on error
  }
}

/**
 * Determines if a time is in the past or future compared to current time
 * @param timeStr Time string in format like "9:00 AM" or "1:30 pm - 4:30 pm"
 * @returns "past" or "future"
 */
export function getTimeStatus(timeStr: string): "past" | "future" {
  if (!timeStr || timeStr === "N/A" || timeStr === "-") {
    return "future" // Default to future if no time
  }

  try {
    // Current time
    const now = new Date()
    
    // Extract start time from time range if applicable (e.g., "1:30 pm - 4:30 pm")
    let startTimeStr = timeStr;
    if (timeStr.includes('-')) {
      startTimeStr = timeStr.split('-')[0].trim();
    }

    // Parse the time string (format: "9:00 AM" or "1:30 pm")
    const timeRegex = /(\d+):(\d+)\s*(am|pm|AM|PM)/i
    const match = startTimeStr.match(timeRegex)

    if (!match) {
      return "future" // Invalid format, default to future
    }

    let hours = Number.parseInt(match[1], 10)
    const minutes = Number.parseInt(match[2], 10)
    const period = match[3].toUpperCase()

    // Convert to 24-hour format
    if (period === "PM" && hours < 12) {
      hours += 12
    } else if (period === "AM" && hours === 12) {
      hours = 0
    }

    // Create a date object with today's date and the exam time
    const examTime = new Date()
    examTime.setHours(hours, minutes, 0, 0)

    // Compare times
    return now.getTime() > examTime.getTime() ? "past" : "future"
  } catch (error) {
    console.error("Error parsing time:", error)
    return "future" // Default to future on error
  }
}

export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr || dateStr === "N/A" || dateStr === "-") {
    return dateStr
  }
  
  // Simply return the original date string without any parsing
  return dateStr
}

export function extractPostponedDate(remarks: string): string | undefined {
  if (!remarks) return undefined

  // Look for date patterns in the format MM/DD/YYYY
  const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/
  const match = remarks.match(datePattern)

  if (match) {
    return match[0]
  }

  return undefined
}

/**
 * Gets a human-readable status message based on exam status
 * @param status The exam status
 * @param isToday Whether the exam is today
 * @returns A human-readable status message
 */
export function getStatusMessage(
  status: "past" | "today-past" | "upcoming" | "postponed-past" | "postponed-upcoming" | "today" | "future" ,
  isToday = false,
): string {
  switch (status) {
    case "past":
      return "This exam has already taken place on a previous date."
    case "today-past":
      return "This exam was scheduled for today, but the time has already passed."
    case "postponed-past":
      return "This exam was postponed and the new date has passed."
    case "postponed-upcoming":
      return "This exam has been postponed. Please check the new schedule."
    case "upcoming":
      return isToday ? "This exam is scheduled for today and is upcoming." : "Your exam is scheduled as shown above."
    default:
      return "Please check your exam schedule."
  }
}

