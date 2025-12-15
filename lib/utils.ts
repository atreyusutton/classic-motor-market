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

export function formatCurrency(amount?: number | null, currency: string = "USD") {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (amount === null || amount === undefined) {
    return formatter.format(0);
  }
  return formatter.format(amount);
}

/**
 * Get Cloudflare image URL from image ID
 * @param imageId - The Cloudflare image ID
 * @param variant - The image variant (default: 'public')
 * @returns Full Cloudflare image URL
 */
export function getCloudflareImageUrl(imageId: string, variant: string = 'public'): string {
  if (imageId.startsWith("http://") || imageId.startsWith("https://")) {
    return imageId
  }
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || process.env.CLOUDFLARE_ACCOUNT_HASH
  
  if (!accountHash) {
    console.warn('CLOUDFLARE_ACCOUNT_HASH not configured, using image ID as-is')
    return imageId
  }
  
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
}
