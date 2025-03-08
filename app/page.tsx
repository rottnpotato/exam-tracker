"use client"

import { useState } from "react"
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

const SearchBar = ({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (id: string) => Promise<void>
  isLoading: boolean 
}) => {
  const [id, setId] = useState("")
  const [inputError, setInputError] = useState("")

  const validateInput = (value: string) => {
    if (!value.trim()) {
      return "Application ID is required"
    }
    if (value.length < 3) {
      return "Application ID must be at least 3 characters"
    }
    return ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateInput(id)
    setInputError(error)
    
    if (!error) {
      onSubmit(id.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value)
    if (inputError) {
      setInputError("")
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col w-full max-w-xl"
      role="search"
      aria-label="Application search"
    >
      <div className="flex-grow">
        <label htmlFor="application-id" className="sr-only">
          Application ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Input
              id="application-id"
              type="text"
              value={id}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter Application ID"
              className={`w-full ${inputError ? 'border-red-500' : ''}`}
              disabled={isLoading}
              aria-label="Enter your application ID"
              aria-describedby={inputError ? "input-error" : "search-description"}
              aria-invalid={!!inputError}
            />
            {inputError && (
              <p 
                id="input-error" 
                className="text-sm text-red-500 mt-1"
                role="alert"
              >
                {inputError}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full sm:w-auto"
            aria-live="polite"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        <span id="search-description" className="sr-only">
          Enter your application ID to check your exam schedule
        </span>
      </div>
    </form>
  )
}

const RefreshButton = ({
  onClick,
  isRefreshing
}: {
  onClick: () => Promise<void>
  isRefreshing: boolean
}) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    disabled={isRefreshing}
    className="flex items-center gap-1"
    aria-label={isRefreshing ? "Refreshing data..." : "Refresh data"}
  >
    <RefreshCw 
      className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} 
      aria-hidden="true"
    />
    {isRefreshing ? "Refreshing..." : "Refresh Data"}
  </Button>
)

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert 
    variant="destructive" 
    className="my-4 max-w-md"
    role="alert"
    aria-live="assertive"
  >
    <AlertCircle className="h-4 w-4" aria-hidden="true" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)

const LoadingSpinner = () => (
  <div 
    className="text-center py-8"
    role="status"
    aria-live="polite"
  >
    <div 
      className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"
      aria-hidden="true"
    />
    <p className="text-lg">Processing...</p>
  </div>
)

export default function Home() {
  const [singleId, setSingleId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [rejectedData, setRejectedData] = useState<RejectedData | null>(null)

  const handleSearch = async (id: string) => {
    setIsLoading(true)
    setError("")
    setProcessedData(null)
    setRejectedData(null)
    setSingleId(id)

    try {
      const [appData, rejData] = await Promise.all([
        fetchApplicationById(id),
        fetchRejectedApplicationById(id)
      ])

      if (appData) {
        setProcessedData(appData)
        return
      }

      if (rejData) {
        setRejectedData(rejData)
        return
      }

      setError("Application not found. Please check your ID and try again.")
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("An error occurred while fetching the data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshScheduleData = async () => {
    setIsRefreshing(true)
    try {
      await clearScheduleCache()
      if (singleId) {
        const data = await fetchLatestScheduleData() // Remove singleId parameter
        if (data) {
          setProcessedData(data)
        }
      }
    } catch (err) {
      console.error("Error refreshing data:", err)
      setError("Failed to refresh data. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <main 
      className="flex flex-col items-center gap-4 sm:gap-6"
      role="main"
      aria-label="Exam Schedule Tracker"
    >
      <div className="w-full max-w-3xl space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <SearchBar onSubmit={handleSearch} isLoading={isLoading} />
          {processedData && (
            <RefreshButton onClick={refreshScheduleData} isRefreshing={isRefreshing} />
          )}
        </div>

        {error && <ErrorAlert message={error} />}
        {isLoading && <LoadingSpinner />}
      </div>

      {processedData && <ResultCards data={processedData} />}
      {rejectedData && <RejectedCard data={rejectedData} />}
    </main>
  )
}

