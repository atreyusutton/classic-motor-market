import Link from "next/link"
import Image from "next/image"
import { Listing, ListingMedia } from "@prisma/client"
import { formatCurrency, generateListingSlug, getCloudflareImageUrl } from "@/lib/utils"

interface ListingCardProps {
  listing: Listing & {
    media: ListingMedia[]
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const coverImage = listing.media.find((m) => m.isCover) || listing.media[0]
  const price = formatCurrency(listing.askingPrice)

  return (
    <Link href={generateListingSlug(listing as any)} className="group flex flex-col h-full border border-border-soft bg-card transition hover:border-brand-gold">
      <div className="relative aspect-[4/3] border-b border-border-soft bg-muted">
        {coverImage ? (
          <Image
            src={getCloudflareImageUrl(coverImage.providerId)}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.35em] text-text-muted">
            No Imagery
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-4 px-5 py-6">
        <div>
          <h3 className="font-serif text-xl text-brand-dark group-hover:text-brand-gold transition-colors">
            {listing.year} {listing.make} {listing.model}
          </h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-text-muted">{listing.location || "Private"}</span>
          <span className="font-serif text-xl text-brand-dark">{price}</span>
        </div>
      </div>
    </Link>
  )
}

