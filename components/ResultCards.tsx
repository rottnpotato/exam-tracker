"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, GraduationCap, MapPin, AlertTriangle, CalendarDays } from "lucide-react"
import { formatDateForDisplay, getStatusMessage } from "@/utils/date-utils"
import type { ProcessedData } from "@/types"
import VenueMap from "./VenueMap"
import StatusIndicator from "./StatusIndicator"
import { searchVenue } from "@/services/venue-service"

// Extracted interfaces for better type organization
interface ResultCardsProps {
  data: ProcessedData
}

interface StatusBadgeProps {
  status: ProcessedData["dateStatus"]
}

interface InfoCardProps {
  data: ProcessedData
}

interface VenueInfoProps {
  venue: string
  hasLocation: boolean
  onViewMap: () => void
}

interface ScheduleInfoProps {
  date: string
  time: string
  status: ProcessedData["dateStatus"]
  isPostponed: boolean
}

interface PostponementInfoProps {
  remarks: string
  postponedDate?: string
  status: ProcessedData["dateStatus"]
}

interface StatusSummaryProps {
  status: ProcessedData["dateStatus"]
  isToday: boolean
}

// Status Badge Component
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { variant, icon, label } = StatusIndicator.getBadgeProps(status)
  return (
    <Badge 
      variant={variant} 
      aria-label={`Status: ${label}`} 
      className="dark:text-white dark:bg-opacity-20 dark:border dark:border-gray-700"
    >
      {label}
    </Badge>
  )
}

// Applicant Information Component
const ApplicantInfo = ({ data }: InfoCardProps) => (
  <div
    className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4 w-full overflow-hidden"
    role="region"
    aria-label="Applicant Information"
  >
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      Applicant Information
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
      <div className="w-full overflow-hidden">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h4>
        <p className="text-base sm:text-lg font-semibold break-words w-full dark:text-white">
          {`${data.first_name} ${data.last_name}`}
        </p>
      </div>
      <div className="w-full overflow-hidden">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Application ID</h4>
        <p className="text-base sm:text-lg font-semibold break-words w-full dark:text-white">{data.id}</p>
      </div>
      <div className="w-full overflow-hidden">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Course</h4>
        <div className="flex items-start gap-2 w-full">
          <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base font-medium break-words w-[calc(100%-24px)] dark:text-white">{data.course}</p>
        </div>
      </div>
    </div>
  </div>
)

// Venue Information Component
const VenueInfo = ({ venue, hasLocation, onViewMap }: VenueInfoProps) => {
  if (!venue) return null;
  
  // Split the venue name at the dash for a natural two-line display
  const [firstLine, secondLine] = venue.split(' - ').map(s => s.trim());

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-start gap-2 w-full">
        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
        {hasLocation ? (
          <Button
            variant="ghost"
            className="h-auto p-0 hover:bg-transparent hover:underline font-medium text-left w-[calc(100%-24px)]"
            onClick={onViewMap}
            aria-label={`View map of ${venue}`}
          >
            <div className="flex flex-col w-full">
              <span className="text-sm sm:text-base w-full overflow-hidden whitespace-normal dark:text-white">{firstLine}</span>
              {secondLine && (
                <span className="text-sm sm:text-base w-full overflow-hidden whitespace-normal dark:text-white">{secondLine}</span>
              )}
            </div>
            <span className="text-xs mt-1 dark:text-gray-400">(Click to view map)</span>
          </Button>
        ) : (
          <div className="flex flex-col w-full">
            <p className="text-sm sm:text-base font-medium w-full overflow-hidden whitespace-normal dark:text-white">{firstLine}</p>
            {secondLine && (
              <p className="text-sm sm:text-base font-medium w-full overflow-hidden whitespace-normal dark:text-white">{secondLine}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// Schedule Information Component
const ScheduleInfo = ({ date, time, status, isPostponed }: ScheduleInfoProps) => {
  const isPast = status === "past" || status === "postponed-past" || status === "today-past"
  
  const { className, icon } = StatusIndicator.getBadgeProps(status)
  
  // Improved background color handling for dark mode
  let bgColor = ""
  let textColor = ""
  if (isPostponed) {
    bgColor = "bg-amber-50 dark:bg-amber-950/30"
    textColor = "dark:text-white"
  } else {
    // Extract the color from className (e.g., "text-green-600" -> "green")
    const colorMatch = className.match(/text-([a-z]+)-\d+/)
    const color = colorMatch ? colorMatch[1] : "gray"
    bgColor = `bg-${color}-50 dark:bg-${color}-900/20`
    textColor = `dark:text-black`
  }
  if(status ==="upcoming"){
    textColor = "dark:text-white"
  }
  
  // Always use black text for the header
  const headerTextColor = "text-black dark:text-black"

  const scheduleType = isPostponed ? "Original Schedule" : "Exam Schedule"

  return (
    <div 
      className={`flex flex-col p-3 rounded-lg ${bgColor} w-full overflow-hidden`}
      role="region"
      aria-label={scheduleType}
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 text-black ${textColor} flex-shrink-0`} aria-hidden="true" />
        <h4 className={`text-sm font-medium text-black ${textColor}`}>
          {scheduleType}
          {status === "today-past" && " (Missed)"}
        </h4>
      </div>
      <div className="flex flex-col gap-2 sm:gap-3 pl-6 sm:pl-7 w-full overflow-hidden">
        <div className="flex flex-col gap-1 w-full overflow-hidden" aria-label="Exam date">
          <div className="flex items-center gap-2 w-full">
            <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
            <p className={`text-sm sm:text-base ${isPast || isPostponed ? "line-through text-gray-500 dark:text-gray-500" : `font-medium text-black ${textColor}`} break-words w-[calc(100%-24px)] overflow-hidden`}>
              {formatDateForDisplay(date)}
            </p>
          </div>
          {status === "today-past" && 
            <p className="text-xs text-red-500 dark:text-red-500 font-medium pl-6" role="alert">(Today)</p>
          }
        </div>
        {time && time !== "N/A" && (
          <div className="flex flex-col gap-1 w-full overflow-hidden" aria-label="Exam time">
            <div className="flex items-center gap-2 w-full">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
              <p className={`text-sm sm:text-base ${isPast || isPostponed ? "line-through text-gray-500 dark:text-gray-500" : `font-medium text-black ${textColor}`} break-words w-[calc(100%-24px)] overflow-hidden`}>
                {time}
              </p>
            </div>
            {status === "today-past" && 
              <p className="text-xs text-red-500 dark:text-red-500 font-medium pl-6" role="alert">(Time passed)</p>
            }
          </div>
        )}
      </div>
    </div>
  )
}


// Postponement Information Component
const PostponementInfo = ({ remarks, postponedDate, status }: PostponementInfoProps) => (
  <div 
    className="flex flex-col p-3 bg-amber-50 dark:bg-amber-950 rounded-lg w-full overflow-hidden"
    role="alert"
    aria-label="Postponement Notice"
  >
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
      <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">Postponement Notice</h4>
    </div>
    <div className="pl-6 sm:pl-7 space-y-2 w-full overflow-hidden">
      <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-300 whitespace-pre-wrap break-all w-full overflow-hidden">{remarks}</p>
      {postponedDate && (
        <div className="flex items-center gap-2 w-full overflow-hidden">
          <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 break-words w-[calc(100%-24px)] overflow-hidden">
            New Schedule: {formatDateForDisplay(postponedDate)}
          </p>
        </div>
      )}
    </div>
  </div>
)

// Status Summary Component
const StatusSummary = ({ status, isToday }: StatusSummaryProps) => {
  // Get base color from status
  let baseColor = "gray";
  if (status.includes("upcoming")) baseColor = "blue";
  else if (status.includes("today") && !status.includes("past")) baseColor = "green";
  else if (status.includes("past")) baseColor = "gray";
  else if (status.includes("postponed")) baseColor = "amber";
  
  const icon = StatusIndicator.getIcon(status);
  const message = getStatusMessage(status, isToday);

  return (
    <div 
      className={`p-3 sm:p-4 rounded-lg bg-${baseColor}-50 dark:bg-${baseColor}-900/20 border border-${baseColor}-200 dark:border-${baseColor}-800 w-full overflow-hidden`}
      role="status"
      aria-label="Status Summary"
    >
      <div className="flex items-start gap-2 w-full overflow-hidden">
        <span className={`flex-shrink-0 mt-0.5 sm:mt-1 text-${baseColor}-600 dark:text-${baseColor}-400`}>
          {icon}
        </span>
        <p className={`text-sm sm:text-base font-medium break-words w-[calc(100%-24px)] overflow-hidden text-${baseColor}-700 dark:text-${baseColor}-700`}>
          {message}
        </p>
      </div>
    </div>
  );
};


// Main ResultCards Component
export default function ResultCards({ data }: ResultCardsProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const venue = searchVenue(data.exam_venue)

  return (
    <div className="grid gap-4 w-full max-w-3xl mx-auto px-4 sm:px-6">
      <Card 
        className={`overflow-hidden border-l-4 ${
          StatusIndicator.getCardBorder(data.dateStatus)
        } transition-all hover:shadow-md w-full`}
        role="article"
        aria-label="Exam Information Card"
        style={{ maxWidth: "100%" }}
      >
        <CardHeader 
  className={`p-3 sm:p-6 pb-2 ${StatusIndicator.getHeaderBackground(data.status)} dark:bg-opacity-0 dark:text-white`}
>
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
    <CardTitle className="text-base sm:text-lg md:text-xl dark:text-white">Exam Information</CardTitle>
    <div className="sm:ml-auto">
      <StatusBadge status={data.dateStatus} />
    </div>
  </div>
</CardHeader>


        <CardContent className="p-3 sm:p-6 pt-4 sm:pt-6">
          <div className="grid gap-3 sm:gap-4 md:gap-6 w-full">
            <ApplicantInfo data={data} />

            <div className="w-full overflow-hidden">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                Exam Details
              </h3>
              <div className="grid gap-3 sm:gap-4 w-full">
                <VenueInfo
                  venue={data.exam_venue}
                  hasLocation={!!venue}
                  onViewMap={() => setIsMapOpen(true)}
                />
                <ScheduleInfo
                  date={data.date}
                  time={data.time}
                  status={data.dateStatus}
                  isPostponed={data.isPostponed}
                />
                {data.isPostponed && (
                  <PostponementInfo
                    remarks={data.remarks}
                    postponedDate={data.postponedDate}
                    status={data.dateStatus}
                  />
                )}
              </div>
            </div>

            <StatusSummary status={data.dateStatus} isToday={data.isToday} />
          </div>
        </CardContent>
      </Card>

      {venue && (
        <VenueMap
          venueName={data.exam_venue}
          coordinates={venue}
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
        />
      )}
    </div>
  )
}
