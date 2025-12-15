import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateListingSlug(listing: { year: number | null; make: string | null; model: string | null; publicId: string }) {
  const parts = [
    listing.year,
    listing.make,
    listing.model
  ].filter(Boolean).map(p => p?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  
  return `/listings/${parts.join('-')}-${listing.publicId}`;
}

export function formatCurrencyFromCents(amount?: number | null, currency: string = "USD") {
  if (!amount) return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(0)
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100)
}

/**
 * Get Cloudflare image URL from image ID
 * @param imageId - The Cloudflare image ID
 * @param variant - The image variant (default: 'public')
 * @returns Full Cloudflare image URL
 */
export function getCloudflareImageUrl(imageId: string, variant: string = 'public'): string {
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || process.env.CLOUDFLARE_ACCOUNT_HASH
  
  if (!accountHash) {
    console.warn('CLOUDFLARE_ACCOUNT_HASH not configured, using image ID as-is')
    return imageId
  }
  
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
}
