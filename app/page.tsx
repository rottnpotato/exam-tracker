"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import ResultCards from "@/components/ResultCards"
import RejectedCard from "@/components/RejectedCard"
import type { ProcessedData, RejectedData } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { 
  fetchApplicationById, 
  fetchRejectedApplicationById, 
  fetchLatestScheduleData,
  clearScheduleCache 
} from "@/services/data-service"

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [rejectedData, setRejectedData] = useState<RejectedData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [singleId, setSingleId] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch latest schedule data on mount
  useEffect(() => {
    refreshScheduleData()
  }, [])

  // Function to refresh schedule data
  const refreshScheduleData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      
      // Clear the schedule cache to force a refresh
      clearScheduleCache()
      
      // Fetch the latest data (this will update the internal cache)
      await fetchLatestScheduleData()
      
      // If we have current data, update it with the new schedule
      if (processedData && processedData.id) {
        await updateCurrentData(processedData.id.toString())
      }
    } catch (error) {
      console.error("Failed to refresh schedule data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [processedData])

  // Function to update current data with latest schedule
  const updateCurrentData = useCallback(async (id: string) => {
    if (!id) return
    try {
      // Fetch application data with latest schedule
      const appData = await fetchApplicationById(id)
      if (appData) {
        setProcessedData(appData)
      }
    } catch (error) {
      console.error("Error updating current data:", error)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setProcessedData(null)
    setRejectedData(null)

    try {
      // Try to fetch application data (which will use the latest schedule data)
      const appData = await fetchApplicationById(singleId)

      if (appData) {
        setProcessedData(appData)
        return
      }

      // If not found, try rejected applications
      const rejData = await fetchRejectedApplicationById(singleId)
      if (rejData) {
        setRejectedData(rejData)
        return
      }

      // If both endpoints return no valid data
      setError("Application not found. Please check your ID and try again.")
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("An error occurred while fetching the data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Application Status Checker</h1>
      <div className="mb-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enter Application ID</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshScheduleData}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            type="text"
            value={singleId}
            onChange={(e) => setSingleId(e.target.value)}
            placeholder="Enter Application ID"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Submit"}
          </Button>
        </form>
      </div>
      {isLoading && (
        <div className="text-center my-4">
          <p className="text-lg">Processing...</p>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="my-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {processedData && <ResultCards data={processedData} />}
      {rejectedData && <RejectedCard data={rejectedData} />}
    </main>
  )
}

