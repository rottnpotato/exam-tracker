"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Navigation, AlertTriangle } from "lucide-react"
import { getGoogleMapsUrl, getDirectionsUrl } from "@/services/venue-service"
import type { VenueLocation } from "@/types"

interface VenueMapProps {
  venueName: string
  coordinates: { lat: number; lng: number }
  isOpen: boolean
  onClose: () => void
}

// Separate map state hook for better reusability
const useMapState = (coordinates: VenueMapProps['coordinates'], venueName: string) => {
  const [mapUrl, setMapUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [requestCount, setRequestCount] = useState<number>(0)
  const [limitReached, setLimitReached] = useState<boolean>(false)

  useEffect(() => {
    async function fetchMapUrl() {
      if (coordinates) {
        setIsLoading(true)
        setError("")
        try {
          const response = await fetch(
            `/api/getMapUrl?lat=${coordinates.lat}&lng=${coordinates.lng}&venue=${encodeURIComponent(venueName)}`
          )
          const data = await response.json()
          
          if (!response.ok) {
            if (response.status === 429 && data.limitReached) {
              setLimitReached(true)
              setRequestCount(data.requestCount)
            }
            throw new Error(data.error || 'Failed to load map')
          }
          
          setMapUrl(data.mapUrl)
          setRequestCount(data.requestCount)
          setLimitReached(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load map')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchMapUrl()
  }, [coordinates, venueName])

  return { mapUrl, isLoading, error, requestCount, limitReached }
}

// Separate MapDisplay component for better organization
const MapDisplay = ({ 
  mapUrl, 
  isLoading, 
  error, 
  limitReached, 
  requestCount, 
  venueName 
}: { 
  mapUrl: string
  isLoading: boolean
  error: string
  limitReached: boolean
  requestCount: number
  venueName: string
}) => (
  <div 
    className="relative rounded-lg overflow-hidden border h-[300px] sm:h-[400px] bg-gray-100"
    role="region"
    aria-label={`Map of ${venueName}`}
  >
    {isLoading ? (
      <div className="flex items-center justify-center h-full" aria-live="polite">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary" 
             role="progressbar" 
             aria-label="Loading map">
        </div>
      </div>
    ) : error || limitReached ? (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2 p-4" 
           role="alert" 
           aria-live="assertive">
        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" />
        <p className="text-center">{error}</p>
        {limitReached && (
          <div className="text-center">
            <p className="font-semibold">API Request Limit Near</p>
            <p className="text-sm text-gray-600">Current request count: {requestCount}/10000</p>
            <p className="text-sm text-gray-600">Counter will reset at midnight</p>
            <p className="text-sm text-gray-600 mt-2">Please use the external map links below</p>
          </div>
        )}
      </div>
    ) : (
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${venueName}`}
        aria-label={`Interactive map showing location of ${venueName}`}
      />
    )}
  </div>
)

// Main VenueMap component
export default function VenueMap({ venueName, coordinates, isOpen, onClose }: VenueMapProps) {
  const { mapUrl, isLoading, error, requestCount, limitReached } = useMapState(coordinates, venueName)
  
  // Create URLs for external links
  const venue: VenueLocation = { name: venueName, address: "", ...coordinates }
  const googleMapsUrl = `${getGoogleMapsUrl(venue)}&query=${encodeURIComponent(venueName)}`
  const directionsUrl = `${getDirectionsUrl(venue)}&destination_place_id=${encodeURIComponent(venueName)}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            {venueName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <MapDisplay 
            mapUrl={mapUrl}
            isLoading={isLoading}
            error={error}
            limitReached={limitReached}
            requestCount={requestCount}
            venueName={venueName}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={() => window.open(googleMapsUrl, "_blank")}
              aria-label={`View ${venueName} in Google Maps`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Larger Map
            </Button>

            <Button
              variant="default"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={() => window.open(directionsUrl, "_blank")}
              aria-label={`Get directions to ${venueName}`}
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Get Directions
            </Button>
          </div>

          {!limitReached && !error && !isLoading && (
            <div className="text-xs text-gray-500 text-right" aria-live="polite">
              API Requests: {requestCount}/10000 (Resets at midnight)
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

