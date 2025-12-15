import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Gauge, Info, Clock } from "lucide-react"
import { ContactSellerDialog } from "@/components/listing/contact-seller-dialog"
import { WatchlistButton } from "@/components/listing/watchlist-button"
import { ShareButton } from "@/components/listing/share-button"
import { ReportButton } from "@/components/listing/report-button"
import { formatCurrency } from "@/lib/utils"
import { ListingGallery } from "@/components/listing/listing-gallery"
import { SiteContainer } from "@/components/layout/site-container"
import { ListingCard } from "@/components/listing/listing-card"
import { Button } from "@/components/ui/button"

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

  const relatedListings = await prisma.listing.findMany({
    where: {
      listingStatus: "active",
      id: { not: listing.id },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { media: { orderBy: { sortOrder: "asc" } } },
  })

  const savedListingCount = currentUserId ? (((listing as any).savedListings?.length) ?? 0) : 0
  const isSaved = savedListingCount > 0
  const price = formatCurrency(listing.askingPrice)
  const sellerDisplayName = listing.seller.username || listing.seller.name?.split(" ")[0] || "seller"
  const conditionLabel = listing.conditionGrade ? CONDITION_LABELS[listing.conditionGrade as keyof typeof CONDITION_LABELS] : undefined
  const canViewIdentifier = Boolean(session?.user)
  const identifier = listing.vehicleIdentifier || ""
  const displayIdentifier = canViewIdentifier
    ? identifier || "N/A"
    : identifier
    ? `${identifier.slice(0, 4)}••••${identifier.slice(-4)}`
    : "Members only"

  return (
    <div className="bg-page">
      <SiteContainer className="space-y-10 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-end">
          <div className="space-y-2">
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-brand-gold">
              Listing {listing.publicId}
            </p>
            <h1 className="font-serif text-4xl text-brand-dark">
              {listing.year} {listing.make} {listing.model}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-text-muted">
              <span className="flex items-center gap-2">
                <MapPin className="h-3 w-3" /> {listing.location || "Private"}
              </span>
              <span className="flex items-center gap-2">
                <Gauge className="h-3 w-3" /> {listing.mileage ? `${listing.mileage.toLocaleString()} miles` : "Miles undisclosed"}
              </span>
              {conditionLabel && <span className="text-brand-gold">{conditionLabel}</span>}
            </div>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Asking Price</p>
            <p className="font-serif text-4xl text-brand-dark">{price}</p>
          </div>
        </div>

        <ListingGallery media={listing.media} />

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="grid gap-4 border border-border-soft bg-page-alt p-6 text-sm uppercase tracking-[0.25em] text-brand-dark/80 sm:grid-cols-2">
              <SpecRow label="Engine" value={listing.engine || "—"} />
              <SpecRow label="Transmission" value={listing.transmission || "—"} />
              <SpecRow
                label="Exterior / Interior"
                value={`${listing.exteriorColor || "—"} / ${listing.interiorColorMaterial || "—"}`}
              />
              <SpecRow label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} miles` : "—"} />
              <SpecRow label="Location" value={listing.location || "Private"} />
              <SpecRow label="Identifier" value={displayIdentifier} />
            </div>

            <NarrativeCard
              title="Options & Features"
              body={listing.optionsAndFeatures || "Seller did not include additional options or notable equipment."}
            />
            <NarrativeCard
              title="Modifications & Originality"
              body={listing.modifications || "No modifications reported—believed to retain its stock specification."}
            />
            <NarrativeCard
              title="Provenance & Story"
              body={listing.vehicleHistory || "Seller has not provided a detailed provenance yet."}
            />
            <NarrativeCard
              title="Maintenance & Restoration"
              body={listing.maintenanceHistory || "Routine maintenance information will be supplied upon request."}
            />

            <div className="flex flex-wrap gap-3">
              {listing.titleStatus && (
                <Badge className="rounded-none border border-border-strong bg-transparent text-brand-dark">
                  Title: {listing.titleStatus}
                </Badge>
              )}
              {listing.carfaxAvailable && (
                <Badge className="rounded-none border border-border-strong bg-transparent text-brand-dark">
                  Carfax Available
                </Badge>
              )}
              {!listing.titleStatus && !listing.carfaxAvailable && (
                <span className="text-xs uppercase tracking-[0.35em] text-text-muted">Documentation pending</span>
              )}
            </div>
          </div>

          <aside className="space-y-6 border border-border-strong bg-page-alt p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Acquire This Vehicle</p>
              <p className="font-serif text-3xl text-brand-dark">{price}</p>
            </div>
            <div className="space-y-3">
              <ContactSellerDialog
                listingId={listing.id}
                listingTitle={`${listing.year} ${listing.make} ${listing.model}`}
                sellerName={sellerDisplayName}
              />
              <WatchlistButton listingId={listing.id} initialSaved={isSaved} />
              <ShareButton title={`${listing.year} ${listing.make} ${listing.model}`} />
              <ReportButton listingId={listing.id} />
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Seller</p>
              <p className="font-serif text-lg text-brand-dark">@{sellerDisplayName}</p>
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
                Member since {new Date(listing.seller.createdAt).getFullYear()}
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-text-muted">
              Classic Motor Market facilitates introductions between members. Inspect vehicles independently and complete
              your own due diligence before transacting.
            </p>
            <div className="text-xs uppercase tracking-[0.35em] text-text-muted">Listing ID {listing.publicId}</div>
          </aside>
        </div>
      </SiteContainer>

      <section className="bg-page-alt py-16">
        <SiteContainer>
          <div className="flex flex-col gap-4 border-b border-border-soft pb-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <h2 className="font-serif text-3xl text-brand-dark">More automobiles from the clubhouse</h2>
            <Button variant="ghost" asChild>
              <Link href="/listings">Return to catalogue</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedListings.length > 0 ? (
              relatedListings.map((related) => <ListingCard key={related.id} listing={related} />)
            ) : (
              <div className="col-span-full border border-dashed border-border-strong px-6 py-12 text-center text-xs uppercase tracking-[0.35em] text-text-muted">
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
        <CardTitle className="font-serif text-lg uppercase tracking-[0.4em] text-brand-dark">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-text-main whitespace-pre-wrap">{body}</CardContent>
    </Card>
  )
}

