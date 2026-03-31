import Link from "next/link"
import Image from "next/image"
import { Listing, ListingMedia } from "@prisma/client"
import { formatCurrency, generateListingSlug, getCloudflareImageUrl } from "@/lib/utils"

interface ListingCardProps {
  listing: Listing & {
    media: ListingMedia[]
  }
  isPlaceholder?: boolean
}

export function ListingCard({ listing, isPlaceholder = false }: ListingCardProps) {
  const coverImage = listing.media.find((m) => m.isCover) || listing.media[0]
  const price = formatCurrency(listing.askingPrice)
  const isSold = listing.listingStatus === 'sold'
  
  // Check if this is a placeholder (no media and make is "New Arrival")
  const isEarlyAccess = isPlaceholder || (listing.media.length === 0 && listing.make === "New Arrival")
  
  // If early access, redirect to login instead of listing page
  const href = isEarlyAccess ? "/login" : generateListingSlug(listing as any)

  return (
    <Link href={href} className="group flex flex-col h-full bg-card transition">
      <div className="relative aspect-[4/3] bg-muted">
        {isEarlyAccess ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6 text-center">
            <div className="space-y-4">
              <Image
                src="/assets/cmm-logo-white.png"
                alt="Classic Motor Market"
                width={80}
                height={80}
                className="mx-auto opacity-90"
              />
              <div className="space-y-2">
                <div className="inline-block bg-brand-gold px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-brand-dark">
                  Members Only
                </div>
                <p className="text-xs uppercase tracking-[0.1em] text-white/90 font-semibold">
                  New Listing
                </p>
                <p className="text-[0.65rem] uppercase tracking-[0.08em] text-white/60">
                  10-Min Early Access
                </p>
              </div>
            </div>
          </div>
        ) : coverImage ? (
          <Image
            src={getCloudflareImageUrl(coverImage.providerId)}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-text-muted">
            No Imagery
          </div>
        )}
        {isSold && !isEarlyAccess && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2.5 py-1 font-bold text-xs uppercase tracking-[0.08em] shadow-lg">
            SOLD
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-3 px-5 py-5">
        <div>
          <h3 className="font-serif text-xl text-brand-dark group-hover:text-brand-gold transition-colors">
            {listing.year} {listing.make} {listing.model}
            {isSold && !isEarlyAccess && <span className="text-red-600 font-bold"> SOLD</span>}
          </h3>
        </div>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            {!isEarlyAccess && (
              <p className="text-xs uppercase tracking-[0.08em] font-bold text-brand-dark">
                {[
                  listing.mileage ? `${Math.round(listing.mileage / 1000)}k mi` : null,
                  listing.transmission ? listing.transmission.replace(/(\d+)[- ]?speed\s*manual/i, "$1 sp. Manual").replace(/(\d+)[- ]?speed\s*automatic/i, "$1 sp. auto").replace(/(\d+)[- ]?speed/i, "$1 sp.").trim() : null
                ].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-text-muted">
              {isEarlyAccess ? "Member Exclusive" : (listing.location || "Private")}
            </p>
          </div>
          {!isEarlyAccess && <span className="font-serif text-xl text-brand-dark">{price}</span>}
          {isEarlyAccess && (
            <span className="text-xs uppercase tracking-[0.1em] font-bold text-brand-gold">
              Join Now
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

