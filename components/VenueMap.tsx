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

export default function VenueMap({ venueName, coordinates, isOpen, onClose }: VenueMapProps) {
  const [mapUrl, setMapUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [requestCount, setRequestCount] = useState<number>(0)
  const [limitReached, setLimitReached] = useState<boolean>(false)

  // Fetch the map URL from our API when the component mounts or when coordinates change
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

  // Create URLs for external links using the VenueLocation type
  const venue: VenueLocation = {
    name: venueName,
    address: "",
    ...coordinates,
  }
  
  const googleMapsUrl = `${getGoogleMapsUrl(venue)}&query=${encodeURIComponent(venueName)}`
  const directionsUrl = `${getDirectionsUrl(venue)}&destination_place_id=${encodeURIComponent(venueName)}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {venueName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Map Display */}
          <div className="relative rounded-lg overflow-hidden border h-[400px] bg-gray-100">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error || limitReached ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
                <AlertTriangle className="h-8 w-8" />
                <p>{error}</p>
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
                onError={() => setError("Failed to load map")}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(googleMapsUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              View Larger Map
            </Button>

            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => window.open(directionsUrl, "_blank")}
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
          </div>

          {!limitReached && !error && !isLoading && (
            <div className="text-xs text-gray-500 text-right">
              API Requests: {requestCount}/10000 (Resets at midnight)
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

