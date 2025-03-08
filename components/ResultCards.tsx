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

interface ResultCardsProps {
  data: ProcessedData
}

export default function ResultCards({ data }: ResultCardsProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const venue = searchVenue(data.exam_venue)

  return (
    <div className="grid gap-4 w-full max-w-3xl">
      <Card
        className={`overflow-hidden border-l-4 ${StatusIndicator.getCardBorder(
          data.dateStatus,
        )} transition-all hover:shadow-md`}
      >
        <CardHeader className={`pb-2 ${StatusIndicator.getHeaderBackground(data.dateStatus)}`}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Exam Information</CardTitle>
            <StatusBadge status={data.dateStatus} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            {/* Applicant Information */}
            <ApplicantInfo data={data} />

            {/* Exam Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Exam Details</h3>

              <div className="grid gap-4">
                {/* Venue */}
                <VenueInfo
                  venue={data.exam_venue}
                  hasLocation={!!venue}
                  onViewMap={() => setIsMapOpen(true)}
                />

                {/* Original Schedule */}
                <ScheduleInfo
                  date={data.date}
                  time={data.time}
                  status={data.dateStatus}
                  isPostponed={data.isPostponed}
                />
                {/* Postponed Information */}
                {data.isPostponed && (
                  <PostponementInfo
                    remarks={data.remarks}
                    postponedDate={data.postponedDate}
                    status={data.dateStatus}
                  />
                )}
              </div>
            </div>

            {/* Status Summary */}
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

// Status Badge Component
function StatusBadge({ status }: { status: ProcessedData["dateStatus"] }) {
  const { variant, icon, label, className } = StatusIndicator.getBadgeProps(status)

  return (
    <Badge variant={variant} className={className}>
      <span className="flex items-center">
        {icon}
        {label}
      </span>
    </Badge>
  )
}

// Applicant Information Component
function ApplicantInfo({ data }: { data: ProcessedData }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Applicant Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">Full Name</h4>
          <p className="text-lg font-semibold">{`${data.first_name} ${data.last_name}`}</p>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">Application ID</h4>
          <p className="text-lg font-semibold">{data.id}</p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Course</h4>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <p className="font-medium">{data.course}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Venue Information Component
function VenueInfo({
  venue,
  hasLocation,
  onViewMap,
}: {
  venue: string
  hasLocation: boolean
  onViewMap: () => void
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
      <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-blue-700">Exam Venue</h4>
        {hasLocation ? (
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
            onClick={onViewMap}
          >
            {venue} <span className="text-xs ml-1">(Click to view map)</span>
          </Button>
        ) : (
          <p className="font-medium">{venue}</p>
        )}
      </div>
    </div>
  )
}

// Schedule Information Component
function ScheduleInfo({
  date,
  time,
  status,
  isPostponed,
}: {
  date: string
  time: string
  status: ProcessedData["dateStatus"]
  isPostponed: boolean
}) {
  const isPast = status === "past" || status === "postponed-past" || status === "today-past"
  
  // Determine colors based on status
  let bgColor, iconColor, textColor
  if (status === "today-past") {
    bgColor = "bg-red-50"
    iconColor = "text-red-500"
    textColor = "text-red-700"
  } else if (isPast) {
    bgColor = "bg-gray-100"
    iconColor = "text-gray-500"
    textColor = "text-gray-700"
  } else if (isPostponed) {
    bgColor = "bg-amber-50"
    iconColor = "text-amber-500"
    textColor = "text-amber-700"
  } else {
    bgColor = "bg-green-50"
    iconColor = "text-green-500"
    textColor = "text-green-700"
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${bgColor}`}>
      <Calendar className={`h-5 w-5 ${iconColor} mt-0.5`} />
      <div className="flex-1">
        <h4 className={`text-sm font-medium ${textColor}`}>
          {isPostponed ? "Original Schedule" : "Exam Schedule"}
          {status === "today-past" && " (Missed)"}
        </h4>
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-500" />
            <p className={`${isPast || isPostponed ? "line-through text-gray-500" : "font-medium"}`}>
              {formatDateForDisplay(date)}
            </p>
            {status === "today-past" && <span className="text-xs text-red-500 font-medium">(Today)</span>}
          </div>
          {time && time !== "N/A" && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <p className={`${isPast || isPostponed ? "line-through text-gray-500" : "font-medium"}`}>
                {time}
              </p>
              {status === "today-past" && <span className="text-xs text-red-500 font-medium">(Time passed)</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Postponement Information Component
function PostponementInfo({
  remarks,
  postponedDate,
  status,
}: {
  remarks: string
  postponedDate?: string
  status: ProcessedData["dateStatus"]
}) {
  const isPast = status === "postponed-past"
  const bgColor = isPast ? "bg-orange-50" : "bg-amber-50"
  const textColor = isPast ? "text-orange-700" : "text-amber-700"

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${bgColor}`}>
      <AlertTriangle className={`h-5 w-5 ${isPast ? "text-orange-500" : "text-amber-500"} mt-0.5`} />
      <div className="flex-1">
        <h4 className={`text-sm font-medium ${textColor}`}>Postponement Notice</h4>
        <p className="text-sm mt-1">{remarks}</p>

        {postponedDate && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <h4 className={`text-sm font-medium ${textColor}`}>New Exam Date</h4>
            <div className="flex items-center gap-2 mt-1">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <p className={`${isPast ? "line-through text-gray-500" : "font-medium"}`}>
                {formatDateForDisplay(postponedDate)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Status Summary Component
function StatusSummary({
  status,
  isToday,
}: {
  status: ProcessedData["dateStatus"]
  isToday: boolean
}) {
  const bgColor = StatusIndicator.getSummaryBackground(status)
  const icon = StatusIndicator.getIcon(status)
  const message = getStatusMessage(status, isToday)

  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{message}</h3>
      </div>
    </div>
  )
}

