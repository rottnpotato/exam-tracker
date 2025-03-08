import type { VenueLocation } from "@/types"

// Database of venues with accurate coordinates
const venueDatabase: VenueLocation[] = [
  {
    name: "BoholIslandStateUniversity-CandijayCampus",
    address: "Bohol Island State University Candijay Campus, Tagbilaran East Road, Poblacion, Candijay, Bohol, Central Visayas, 6312, Philippines",
    lat: 9.83486805,
    lng: 124.52998639604577
  },
  {
    name: "BoholIslandStateUniversity-BalilihanCampus",
    address: "Bohol Island State University - Balilihan Campus, Corella - Balilihan Road, Del Carmen Weste, Poblacion, Balilihan, Bohol, Central Visayas, Philippines",
    lat: 9.7446957,
    lng: 123.962162
  },
  {
    name: "BoholIslandStateUniversity-BilarCampus",
    address: "P495+6RF, Bilar, Bohol",
    lat: 9.718288762783592,
    lng: 124.10953433698481
  },
  {
    name: "BoholIslandStateUniversity-BINGAG-DAUISCampus",
    address: "JR32+GVM, Dauis - Panglao Rd, Dauis, Bohol",
    lat: 9.604044356653406,
    lng: 123.80222104253725
  },
  {
    name: "BoholIslandStateUniversity-CalapeCampus",
    address: "VVVJ+RXG, Calape, 6328 Bohol",
    lat: 9.894687690448325,
    lng: 123.88256918301862
  },
  {
    name: "BoholIslandStateUniversity-CLARINCampus",
    address: "X27F+CQ3, Clarin, Bohol",
    lat: 9.963720190699068,
    lng: 124.02443383419356
  },
  {
    name: "FaraonNationalHighSchool-Jagna,Bohol",
    address: "J8MW+823, Jagna, Bohol",
    lat: 9.63346924137348,
    lng: 124.34514915417864
  },
  {
    name: "KatipunanNationalHighSchool-Carmen,Bohol",
    address: "R6Q9+PVH, Carmen, Bohol",
    lat: 9.839539081686855,
    lng: 124.21975492349436
  },
  {
    name: "SanJoseNationalHighSchool-Talibon,Bohol",
    address: "48VC+G78, San Jose, Talibon, Bohol, San Jose Barangay Rd, Talibon, Bohol",
    lat: 10.143972729160124,
    lng: 124.32074733884302
  },
  {
    name: "UbayNationalScienceHighSchool-Ubay,Bohol",
    address: "2FWF+QVJ, E Aumentado Ave, Ubay, Bohol",
    lat: 10.047120454674284,
    lng: 124.47457192164639
  }
]

// Helper function to normalize venue names for comparison
function normalizeVenueName(name: string | undefined): string {
  if (!name) return '';
  
  return name
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[-,]/g, "") // Remove hyphens and commas
    .toLowerCase() // Convert to lowercase
}

/**
 * Searches for a venue in the database
 * @param venueName The name of the venue to search for
 * @returns The venue location if found, undefined otherwise
 */
export function searchVenue(venueName: string): VenueLocation | undefined {
  const normalizedSearchName = normalizeVenueName(venueName)
  return venueDatabase.find(
    venue => normalizeVenueName(venue.name) === normalizedSearchName
  )
}

/**
 * Gets a Google Maps URL for a venue
 * @param venue The venue location
 * @returns Google Maps URL
 */
export function getGoogleMapsUrl(venue: VenueLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`
}

/**
 * Gets directions to a venue from the user's current location
 * @param venue The venue location
 * @returns Google Maps directions URL
 */
export function getDirectionsUrl(venue: VenueLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`
}

