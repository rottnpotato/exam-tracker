"use client"
import type React from "react"
import * as XLSX from "xlsx"
import type { ProcessedData } from "@/types"
import { fetchLatestScheduleData } from "@/services/data-service"

interface FileUploadProps {
  setProcessedData: (data: ProcessedData[]) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export default function FileUpload({ setProcessedData, setIsLoading, setError }: FileUploadProps) {
  // Function to get schedule data for an application ID from the dynamic data
  const findScheduleData = async (applicationId: string | number, scheduleData: any[]) => {
    const schedule = scheduleData.find((s) => s["Application ID"].toString() === applicationId.toString())
    return {
      date: schedule?.Date || "N/A",
      time: schedule?.Time || "N/A",
      postponed: schedule?.Postponed || "N/A",
      venue: schedule?.["Exam Venue"] || "N/A",
    }
  }

  const processExcelFile = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // First, fetch the latest schedule data from Google Sheets
      const scheduleData = await fetchLatestScheduleData()
      
      // Process the Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      const filteredData = jsonData.filter((row: any) => row["Campus Applied"] === "MAIN" && row["Course"] === "BSPSY")

      const processedData = await Promise.all(
        filteredData.map(async (row: any) => {
          try {
            // Get the schedule data for this application
            const scheduleInfo = await findScheduleData(row["Application ID"], scheduleData)
            
            const response = await fetch("/api/fetchApplicationData", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: row["Application ID"] }),
            })

            if (!response.ok) {
              if (response.status === 404) {
                return {
                  id: row["Application ID"],
                  last_name: "Not Found",
                  first_name: "Not Found",
                  exam_venue: scheduleInfo.venue,
                  error: "Application not found",
                  date: scheduleInfo.date,
                  time: scheduleInfo.time,
                  remarks: scheduleInfo.postponed
                }
              }
              throw new Error(`Failed to fetch data for Application ID: ${row["Application ID"]}`)
            }

            const apiData = await response.json()
            
            return {
              ...apiData,
              date: scheduleInfo.date,
              time: scheduleInfo.time,
              remarks: scheduleInfo.postponed !== "N/A" ? scheduleInfo.postponed : "N/A",
              exam_venue: scheduleInfo.venue !== "N/A" ? scheduleInfo.venue : apiData.exam_venue || "N/A",
            }
          } catch (error) {
            console.error(`Error processing Application ID ${row["Application ID"]}:`, error)
            
            // Get fallback schedule data
            const scheduleInfo = await findScheduleData(row["Application ID"], scheduleData)
            
            return {
              id: row["Application ID"],
              last_name: "Error",
              first_name: "Error",
              exam_venue: scheduleInfo.venue,
              error: "Failed to fetch data",
              date: scheduleInfo.date,
              time: scheduleInfo.time,
              remarks: scheduleInfo.postponed
            }
          }
        }),
      )

      setProcessedData(processedData)
    } catch (error) {
      console.error("Error processing file:", error)
      setError("An error occurred while processing the file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processExcelFile(file)
    }
  }

  return (
    <div className="mb-8">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
      />
    </div>
  )
}

