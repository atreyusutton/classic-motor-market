import { Listing, ListingMedia } from "@prisma/client"

/**
 * Check if a listing is in early access period (10 minutes after creation)
 * Early access listings are only visible to members
 */
export function isInEarlyAccess(listing: { createdAt: Date }): boolean {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  return listing.createdAt > tenMinutesAgo
}

/**
 * Check if a listing should be shown as placeholder to non-members
 */
export function shouldShowAsPlaceholder(
  listing: { createdAt: Date; listingStatus: string },
  isMember: boolean
): boolean {
  // Only apply to active listings
  if (listing.listingStatus !== "active") return false
  
  // Members can see everything
  if (isMember) return false
  
  // Non-members see placeholder for listings in early access
  return isInEarlyAccess(listing)
}

/**
 * Get placeholder data for early access listings
 */
export function getPlaceholderData() {
  return {
    year: new Date().getFullYear(),
    make: "New Arrival",
    model: "Member Exclusive",
    location: "Members Only",
    askingPrice: 0,
    engine: "—",
    transmission: "—",
    exteriorColor: "—",
    interiorColorMaterial: "—",
    mileage: null,
    vehicleIdentifier: "—",
    conditionGrade: null,
    optionsAndFeatures: "This vehicle is available exclusively to Classic Motor Market members for the first 10 minutes after listing.",
    modifications: "Become a member to view full vehicle details and contact the seller.",
    vehicleHistory: "Join our community of enthusiasts to access member-exclusive listings before they go public.",
    maintenanceHistory: "Members get 10-minute early access to all new listings.",
    titleStatus: null,
    carfaxAvailable: false,
  }
}

/**
 * Create a placeholder listing for display to non-members
 */
export function createPlaceholderListing<T extends Listing & { media: ListingMedia[] }>(
  listing: T
): T {
  const placeholder = getPlaceholderData()
  
  return {
    ...listing,
    ...placeholder,
    // Keep these fields for functionality
    id: listing.id,
    publicId: listing.publicId,
    sellerId: listing.sellerId,
    listingStatus: listing.listingStatus,
    createdAt: listing.createdAt,
    // Empty media array - will use placeholder image instead
    media: [],
  } as T
}

