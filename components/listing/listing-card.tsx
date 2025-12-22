import Link from "next/link"
import Image from "next/image"
import { Listing, ListingMedia } from "@prisma/client"
import { formatCurrency, generateListingSlug, getCloudflareImageUrl } from "@/lib/utils"

const CONDITION_LABELS: Record<string, string> = {
  show_car: "Show car",
  driver: "Driver",
  it_runs: "It runs",
  project: "Project",
}

interface ListingCardProps {
  listing: Listing & {
    media: ListingMedia[]
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const coverImage = listing.media.find((m) => m.isCover) || listing.media[0]
  const price = formatCurrency(listing.askingPrice)
  const conditionLabel = listing.conditionGrade ? CONDITION_LABELS[listing.conditionGrade] ?? listing.conditionGrade : "Condition TBD"

  return (
    <Link href={generateListingSlug(listing as any)} className="block border border-border-soft bg-card transition hover:border-brand-gold">
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
      <div className="space-y-3 px-5 py-6">
        <div>
          <h3 className="font-serif text-xl text-brand-dark">
            {listing.year} {listing.make} {listing.model} - {conditionLabel}
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.35em] text-text-muted">{listing.location || "Private"}</span>
          <span className="font-serif text-xl text-brand-dark">{price}</span>
        </div>
      </div>
    </Link>
  )
}

