import { Calendar, AlertTriangle, XCircle, Clock } from "lucide-react"
import type { ProcessedData } from "@/types"

// Status indicator utilities
const StatusIndicator = {
  // Get badge properties based on status
  getBadgeProps: (status: ProcessedData["dateStatus"]) => {
    switch (status) {
      case "past":
        return {
          variant: "outline" as const,
          icon: <XCircle className="h-4 w-4 mr-1" />,
          label: "Past",
          className: "bg-gray-100 text-gray-700 border-gray-200",
        }
      case "today-past":
        return {
          variant: "outline" as const,
          icon: <Clock className="h-4 w-4 mr-1" />,
          label: "Missed Today",
          className: "bg-red-100 text-red-700 border-red-200",
        }
      case "postponed-past":
        return {
          variant: "outline" as const,
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          label: "Postponed (Past)",
          className: "bg-orange-100 text-orange-700 border-orange-200",
        }
      case "postponed-upcoming":
        return {
          variant: "outline" as const,
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          label: "Postponed",
          className: "bg-amber-100 text-amber-700 border-amber-200",
        }
      case "upcoming":
      default:
        return {
          variant: "outline" as const,
          icon: <Calendar className="h-4 w-4 mr-1" />,
          label: "Upcoming",
          className: "bg-green-100 text-green-700 border-green-200",
        }
    }
  },

  // Get card border color based on status
  getCardBorder: (status: ProcessedData["dateStatus"]) => {
    switch (status) {
      case "past":
        return "border-l-gray-500"
      case "today-past":
        return "border-l-red-500"
      case "postponed-past":
        return "border-l-orange-500"
      case "postponed-upcoming":
        return "border-l-amber-500"
      case "upcoming":
      default:
        return "border-l-green-500"
    }
  },

  // Get header background color based on status
  getHeaderBackground: (status: ProcessedData["dateStatus"]) => {
    switch (status) {
      case "past":
        return "bg-gray-50"
      case "today-past":
        return "bg-red-50"
      case "postponed-past":
        return "bg-orange-50"
      case "postponed-upcoming":
        return "bg-amber-50"
      case "upcoming":
      default:
        return "bg-orange-50"
    }
  },

  // Get summary background color based on status
  getSummaryBackground: (status: ProcessedData["dateStatus"]) => {
    switch (status) {
      case "past":
        return "bg-gray-100"
      case "today-past":
        return "bg-red-100"
      case "postponed-past":
        return "bg-orange-100"
      case "postponed-upcoming":
        return "bg-amber-100"
      case "upcoming":
      default:
        return "bg-green-100"
    }
  },

  // Get icon based on status
  getIcon: (status: ProcessedData["dateStatus"]) => {
    switch (status) {
      case "past":
        return <XCircle className="h-5 w-5 text-gray-500" />
      case "today-past":
        return <Clock className="h-5 w-5 text-red-500" />
      case "postponed-past":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "postponed-upcoming":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "upcoming":
      default:
        return <Calendar className="h-5 w-5 text-green-500" />
    }
  },
}

export default StatusIndicator

