import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Clock } from "lucide-react"
import { ContactSellerDialog } from "@/components/listing/contact-seller-dialog"
import { WatchlistButton } from "@/components/listing/watchlist-button"
import { ShareButton } from "@/components/listing/share-button"
import { ReportButton } from "@/components/listing/report-button"
import { formatCurrency, getCloudflareImageUrl } from "@/lib/utils"
import { ListingGallery } from "@/components/listing/listing-gallery"
import { SiteContainer } from "@/components/layout/site-container"
import { ListingCard } from "@/components/listing/listing-card"
import { Button } from "@/components/ui/button"
import { shouldShowAsPlaceholder } from "@/lib/listing-utils"

const CONDITION_LABELS = {
  show_car: "Show car",
  driver: "Driver",
  it_runs: "It runs",
  project: "Project",
} as const

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const uuidMatch = slug.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  const publicId = uuidMatch ? uuidMatch[0] : slug.split('-').pop() || slug

  const session = await auth()
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : undefined

  const listing = await prisma.listing.findUnique({
    where: { publicId },
    include: {
      seller: {
        select: {
          name: true,
          username: true,
          createdAt: true,
        },
      },
      media: {
        orderBy: { sortOrder: "asc" },
      },
      ...(currentUserId
        ? {
            savedListings: {
              where: { userId: currentUserId },
            },
          }
        : {}),
    },
  })

  if (!listing) notFound()

  // Check if this is an early access listing and user is not a member
  const isMember = session?.user?.membershipStatus === "member" || Boolean(session?.user?.isAdmin)
  if (shouldShowAsPlaceholder(listing, isMember)) {
    // Redirect non-members trying to access early access listings
    redirect("/login?message=This listing is available to members only")
  }

  const allOtherListings = await prisma.listing.findMany({
    where: {
      listingStatus: { in: ["active", "sold"] },
      id: { not: listing.id },
    },
    orderBy: [
      { listingStatus: "asc" }, // active first
      { createdAt: "desc" },
    ],
    include: { media: { orderBy: { sortOrder: "asc" } } },
  })

  // unique and scalable shuffle: Fisher-Yates shuffle
  const relatedListings = [...allOtherListings];
  for (let i = relatedListings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [relatedListings[i], relatedListings[j]] = [relatedListings[j], relatedListings[i]];
  }

  const savedListingCount = currentUserId ? (((listing as any).savedListings?.length) ?? 0) : 0
  const isSaved = savedListingCount > 0
  const price = formatCurrency(listing.askingPrice)
  const isOwner = currentUserId === listing.sellerId
  const isLoggedIn = Boolean(currentUserId)
  const sellerDisplayName = listing.seller.username || listing.seller.name?.split(" ")[0] || "seller"
  const conditionLabel = listing.conditionGrade ? CONDITION_LABELS[listing.conditionGrade as keyof typeof CONDITION_LABELS] : undefined
  const canViewIdentifier = Boolean(session?.user)
  const identifier = listing.vehicleIdentifier || ""
  const displayIdentifier = canViewIdentifier
    ? identifier || "N/A"
    : "Sign In to See VIN"
  const isSold = listing.listingStatus === 'sold'

  const coverImage = listing.media.find((m: any) => m.isCover) || listing.media[0]

  return (
    <div className="bg-page">
      <SiteContainer className="space-y-8 sm:space-y-10 py-8 sm:py-12 md:py-16">
        {/* Title + Price */}
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark">
            {isSold && <span className="text-red-600">SOLD </span>}
            {listing.year} {listing.make} {listing.model}
          </h1>
          <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark shrink-0">{price}</span>
        </div>

        {/* Hero Image */}
        {coverImage && (
          <a href="#gallery" className="block relative aspect-[16/9] w-full overflow-hidden bg-card cursor-pointer">
            <Image
              src={getCloudflareImageUrl(coverImage.providerId)}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
              fill
              className="object-cover"
              priority
            />
            {isSold && (
              <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 font-bold text-sm uppercase tracking-[0.1em] shadow-lg">
                SOLD
              </div>
            )}
          </a>
        )}

        {/* All Info */}
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6 sm:space-y-8">
            <div className="grid gap-4 bg-page-alt p-4 sm:p-6 text-xs sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.12em] text-brand-dark/80 grid-cols-1 sm:grid-cols-2">
              <SpecRow label="Engine" value={listing.engine || "—"} />
              <SpecRow label="Transmission" value={listing.transmission || "—"} />
              <SpecRow
                label="Exterior / Interior"
                value={`${listing.exteriorColor || "—"} / ${listing.interiorColorMaterial || "—"}`}
              />
              <SpecRow label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} miles` : "—"} />
              <SpecRow label="Location" value={listing.location || "Private"} />
              <SpecRow label="Condition" value={conditionLabel || "—"} />
              <SpecRow label="VIN" value={displayIdentifier} />
            </div>

            <NarrativeCard
              title="Story"
              body={listing.vehicleHistory || "Seller has not provided a detailed story yet."}
            />
            <NarrativeCard
              title="Maintenance & Restoration"
              body={listing.maintenanceHistory || "Routine maintenance information will be supplied upon request."}
            />
            <NarrativeCard
              title="Options & Features"
              body={listing.optionsAndFeatures || "Seller did not include additional options or notable equipment."}
            />
            <NarrativeCard
              title="Modifications & Originality"
              body={listing.modifications || "No modifications reported—believed to retain its stock specification."}
            />

            <div className="flex flex-wrap gap-3">
              {listing.titleStatus && (
                <Badge className="rounded-none bg-transparent text-brand-dark">
                  Title: {listing.titleStatus}
                </Badge>
              )}
              {listing.carfaxAvailable && (
                <Badge className="rounded-none bg-transparent text-brand-dark">
                  Carfax Available
                </Badge>
              )}
              {!listing.titleStatus && !listing.carfaxAvailable && (
                <span className="text-xs uppercase tracking-[0.18em] text-text-muted">Documentation pending</span>
              )}
            </div>
          </div>

          <aside className="space-y-5 sm:space-y-6 bg-page-alt p-4 sm:p-6 lg:order-last">
            <div>
              <p className="font-serif text-base sm:text-lg text-brand-dark">{listing.year} {listing.make} {listing.model}</p>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">{price}</p>
              {isSold && (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2">
                  <p className="text-sm font-bold text-red-600 uppercase tracking-[0.1em]">Vehicle Sold</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {isSold ? (
                <Button className="w-full" disabled variant="secondary">
                  No Longer Available
                </Button>
              ) : isOwner ? (
                <Button className="w-full" asChild>
                  <Link href="/account/listings">View My Listings</Link>
                </Button>
              ) : !isLoggedIn ? (
                <Button className="w-full" asChild>
                  <Link href="/login">Contact Seller</Link>
                </Button>
              ) : !isMember ? (
                <Button className="w-full" asChild>
                  <Link href="/account/billing">Contact Seller</Link>
                </Button>
              ) : (
                <ContactSellerDialog
                  listingId={listing.id}
                  listingTitle={`${listing.year} ${listing.make} ${listing.model}`}
                  sellerName={sellerDisplayName}
                />
              )}
              {!isSold && <WatchlistButton listingId={listing.id} initialSaved={isSaved} isLoggedIn={isLoggedIn} />}
              <ShareButton title={`${listing.year} ${listing.make} ${listing.model}`} />
              <div className="text-center">
                <ReportButton listingId={listing.id} />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] text-text-muted">Seller</p>
              <p className="font-serif text-base sm:text-lg text-brand-dark">Private</p>
              <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] text-text-muted">
                Member since {new Date(listing.seller.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] leading-relaxed text-text-muted">
              Classic Motor Market facilitates introductions between members. Inspect vehicles independently and complete
              your own due diligence before transacting.
            </p>
            <div className="text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] text-text-muted">Listing ID {listing.publicId}</div>
          </aside>
        </div>

        {/* Image Gallery */}
        {listing.media.length > 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-brand-dark">Gallery</h2>
            <ListingGallery media={listing.media} isSold={isSold} />
          </div>
        )}
      </SiteContainer>

      <section className="bg-page-alt py-12 sm:py-16">
        <SiteContainer>
          <div className="flex flex-col gap-4 pb-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">More automobiles from the clubhouse</h2>
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/listings">Return to catalogue</Link>
            </Button>
          </div>
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedListings.length > 0 ? (
              relatedListings.map((related) => <ListingCard key={related.id} listing={related} />)
            ) : (
              <div className="col-span-full px-6 py-12 text-center text-xs uppercase tracking-[0.18em] text-text-muted">
                Additional listings arrive shortly.
              </div>
            )}
          </div>
        </SiteContainer>
      </section>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-soft pb-3 last:border-none last:pb-0">
      <span className="text-[0.55rem] text-text-muted">{label}</span>
      <span className="font-serif text-base normal-case tracking-normal text-brand-dark">{value}</span>
    </div>
  )
}

function NarrativeCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base sm:text-lg uppercase tracking-[0.18em] sm:tracking-[0.2em] text-brand-dark">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs sm:text-sm leading-relaxed text-text-main whitespace-pre-wrap">{body}</CardContent>
    </Card>
  )
}

