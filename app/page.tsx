import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listing/listing-card"
import { auth } from "@/auth"
import { SiteContainer } from "@/components/layout/site-container"
import { cn, getCloudflareImageUrl, formatCurrency, generateListingSlug } from "@/lib/utils"
import { shouldShowAsPlaceholder, createPlaceholderListing } from "@/lib/listing-utils"

export const dynamic = "force-dynamic"

const membershipBenefits = [
  "Discreet seller contact via relay",
  "10-minute early access to new listings",
  "Full VIN visibility for due diligence",
  "First listing included with membership",
  "Purchase vehicles without auction pressure",
  "Inspect and test drive on your schedule",
]

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-soft pb-2 last:border-none last:pb-0">
      <span className="text-[0.55rem] uppercase tracking-[0.1em] font-bold text-text-muted">{label}</span>
      <span className="font-serif text-sm text-brand-dark font-medium leading-tight">{value}</span>
    </div>
  )
}

export default async function Home() {
  const session = await auth()
  const isMember = !!session?.user

  const featuredListingsRaw = await prisma.listing.findMany({
    where: {
      listingStatus: { in: ["active", "sold"] },
      featured: true,
    },
    orderBy: [
      { listingStatus: "asc" }, // active first
      { createdAt: "desc" },
    ],
    take: 5,
    include: { media: { orderBy: { sortOrder: "asc" } } },
  })

  // Transform early access listings to placeholders for non-members
  const featuredListings = featuredListingsRaw.map((listing) => {
    if (shouldShowAsPlaceholder(listing, isMember)) {
      return createPlaceholderListing(listing)
    }
    return listing
  })

  let displayListings = featuredListings
  if (featuredListings.length < 5) {
    const recentListingsRaw = await prisma.listing.findMany({
      where: {
        listingStatus: { in: ["active", "sold"] },
        featured: false,
        id: { notIn: featuredListings.map((l) => l.id) },
      },
      orderBy: [
        { listingStatus: "asc" }, // active first
        { createdAt: "desc" },
      ],
      take: 5 - featuredListings.length,
      include: { media: { orderBy: { sortOrder: "asc" } } },
    })
    
    // Transform these as well
    const recentListings = recentListingsRaw.map((listing) => {
      if (shouldShowAsPlaceholder(listing, isMember)) {
        return createPlaceholderListing(listing)
      }
      return listing
    })
    
    displayListings = [...featuredListings, ...recentListings]
  }

  const largeListings = displayListings.slice(0, 2)
  const cardListings = displayListings.slice(2, 5)

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[85vh] sm:min-h-[90vh] overflow-hidden">
        <Image
          src="/assets/hero-porsche.png"
          alt="Classic touring car"
          fill
          priority
          className="object-cover brightness-[0.7]"
        />
        <SiteContainer className="relative flex min-h-[85vh] sm:min-h-[90vh] flex-col items-center justify-center gap-6 sm:gap-8 px-4 text-center text-white">
          <Image
            src="/assets/cmm-logo-white.png"
            alt="Classic Motor Market monogram"
            width={128}
            height={128}
            className="h-20 sm:h-24 w-auto"
            priority
          />
          <div className="max-w-3xl space-y-4 sm:space-y-6 px-2">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-brand-gold italic drop-shadow-sm">
              Drive your next adventure...
            </h1>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-white drop-shadow-md">
              Classic Motor Market is an affordable member-driven sales platform for European enthusiast vehicles.
            </p>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-white drop-shadow-md">
              Built by car enthusiasts for car enthusiasts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto px-2">
            <Button asChild size="lg" className="h-9 sm:h-12 px-4 sm:px-10 text-[0.6rem] sm:text-base min-w-[130px] sm:min-w-[200px] bg-brand-dark text-white border-white transition-all duration-300 hover:bg-brand-dark/80 hover:brightness-110 hover:shadow-lg">
              <Link href="/listings">Browse Listings</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-9 sm:h-12 px-4 sm:px-10 text-[0.6rem] sm:text-base min-w-[130px] sm:min-w-[200px] bg-page text-black border-black transition-all duration-300 hover:bg-page hover:brightness-90 hover:shadow-lg"
            >
              <Link href="/sell">List a Vehicle</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      <div className="h-1 w-full bg-white/60" />

      <section className="relative h-[32rem] w-full overflow-hidden">
        <Image
          src="/assets/hero-line.png"
          alt="Lifestyle imagery"
          fill
          className="object-cover object-[center_20%] saturate-50"
        />
      </section>

      <section className="bg-page py-12 sm:py-16 md:py-20">
        <SiteContainer className="grid gap-8 sm:gap-12">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Image
              src="/assets/ff-logo.png"
              alt="Fuelfed logo"
              width={140}
              height={140}
              className="h-16 sm:h-20 w-auto"
            />
            <div className="h-px w-12 sm:w-16 bg-border-strong sm:h-16 sm:w-px" />
            <Image
              src="/assets/cmm-logo-blue.png"
              alt="Classic Motor Market logo"
              width={140}
              height={140}
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <div className="space-y-4 sm:space-y-5 text-sm leading-relaxed text-brand-dark">
            <p className="font-serif text-xl sm:text-2xl text-brand-dark">
              From the Founders of the classic European car club, Fuelfed, comes a new sales platform for classic and enthusiast European vehicles. Take back control of the sales process with Classic Motor Market.
            </p>

            <div className="space-y-4 text-brand-dark">
              <p>
                <span className="font-bold text-brand-dark">Privacy and Security.</span> Avoid scammers and deal with
                real people. Only approved Classic Motor Market members can contact sellers.
              </p>
              <p>
                <span className="font-bold text-brand-dark">Cost Effective.</span> CMM members pay only $29 per listing.
                No high fees or percentage commissions. All sales are completed offline with other approved CMM members.
              </p>
              <p>
                <span className="font-bold text-brand-dark">Specialized listing process.</span> Makes it fast and easy to
                create high quality listings. No waiting weeks for a stressful auction listing to go live.
              </p>
              <p>
                <span className="font-bold text-brand-dark">
                Only members can see the VIN.</span>The VIN never appears in online searches and is protected from scammers.
              </p>
            </div>
            <Button asChild className="uppercase tracking-[0.18em]">
              <Link href="/sell">List Your Vehicle</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      <section className="bg-page-alt py-12 sm:py-16 text-center">
        <SiteContainer className="space-y-5 sm:space-y-6">
          <p className="font-serif text-[0.65rem] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.12em] text-brand-dark">
            Membership · $49 yearly
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl text-brand-dark px-4">
          Why join a Classic Motor Market as a buyer?
          </h3>
          <div className="grid gap-3 sm:gap-4 text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] text-brand-dark/80 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {membershipBenefits.map((benefit) => (
              <div key={benefit} className="bg-card px-4 py-5 sm:py-6">
                {benefit}
              </div>
            ))}
          </div>
          <Button asChild variant="secondary" className="w-full sm:w-auto h-11 sm:h-12">
            <Link href="/register">Become a Member</Link>
          </Button>
        </SiteContainer>
      </section>

      <section className="bg-page py-12 sm:py-16 md:py-20 border-t border-border-soft/30">
        <SiteContainer className="space-y-12 sm:space-y-20">
          <div className="flex flex-col gap-4 pb-6 sm:pb-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div className="space-y-2">
              <p className="font-serif text-[0.65rem] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.12em] text-brand-dark">
                Member Listings
              </p>
              <h4 className="font-serif text-2xl sm:text-3xl text-brand-dark px-2 sm:px-0">
                Hand-picked vehicles presently inside the showroom
              </h4>
              <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.18em] text-text-muted">
                One-column on mobile, three on desktop. No clutter, just cars.
              </p>
            </div>
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/listings">View the catalogue</Link>
            </Button>
          </div>

          {/* Large Listings */}
          <div className="space-y-12 sm:space-y-24">
            {largeListings.map((listing, index) => {
              const coverImage = listing.media.find((m) => m.isCover) || listing.media[0]
              const isEarlyAccess = listing.media.length === 0 && listing.make === "New Arrival"
              const href = isEarlyAccess ? "/login" : generateListingSlug(listing)
              
              return (
                <div 
                  key={listing.id} 
                  className="bg-card p-6 sm:p-8 md:p-10 shadow-sm"
                >
                  <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
                    <div className={cn("space-y-8", index % 2 === 1 ? "lg:order-last" : "")}>
                      <div className="space-y-2">
                        <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.1em] text-brand-gold font-semibold">
                          {isEarlyAccess ? "Member Exclusive Preview" : "Featured Showcase"}
                        </p>
                        <Link href={href}>
                          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark hover:text-brand-gold transition-colors">
                            {listing.year} {listing.make} {listing.model}
                          </h3>
                        </Link>
                      </div>
                      
                      <div className="space-y-6 text-sm sm:text-base text-brand-dark/80 leading-relaxed">
                        {listing.optionsAndFeatures && (
                          <p className="line-clamp-4">{listing.optionsAndFeatures}</p>
                        )}
                        {listing.vehicleHistory && (
                          <p className="line-clamp-4">{listing.vehicleHistory}</p>
                        )}
                        {listing.maintenanceHistory && (
                          <p className="line-clamp-4">{listing.maintenanceHistory}</p>
                        )}
                        {!listing.optionsAndFeatures && !listing.vehicleHistory && !listing.maintenanceHistory && !isEarlyAccess && (
                          <p>This exceptional {listing.make} represents a unique opportunity for enthusiasts. Presented in remarkable condition with a focus on originality and preservation.</p>
                        )}
                      </div>

                      <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={href}>
                          {isEarlyAccess ? "Become a Member" : "View Full Details"}
                        </Link>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <Link 
                        href={href}
                        className="relative group block aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-muted"
                      >
                        {isEarlyAccess ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-8 text-center">
                            <div className="space-y-5">
                              <Image
                                src="/assets/cmm-logo-white.png"
                                alt="Classic Motor Market"
                                width={120}
                                height={120}
                                className="mx-auto opacity-90"
                              />
                              <div className="space-y-3">
                                <div className="inline-block bg-brand-gold px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-brand-dark">
                                  Members Only
                                </div>
                                <p className="text-sm uppercase tracking-[0.12em] text-white font-semibold">
                                  New Exclusive Listing
                                </p>
                                <p className="text-xs uppercase tracking-[0.1em] text-white/60">
                                  10 Minutes Early Access
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : coverImage ? (
                          <Image
                            src={getCloudflareImageUrl(coverImage.providerId)}
                            alt={`${listing.year} ${listing.make} ${listing.model}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-text-muted">No Imagery</div>
                        )}
                      </Link>

                      {/* Specifics Box */}
                      <div className="grid grid-cols-2 gap-4 bg-page-alt p-4 sm:p-5">
                        <SpecRow label="Engine" value={listing.engine || "—"} />
                        <SpecRow label="Transmission" value={listing.transmission || "—"} />
                        <SpecRow label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} mi` : "—"} />
                        <SpecRow label="Color" value={listing.exteriorColor || "—"} />
                        <SpecRow label="Location" value={isEarlyAccess ? "Member Exclusive" : (listing.location || "Private")} />
                        <SpecRow label="Price" value={isEarlyAccess ? "Join to View" : formatCurrency(listing.askingPrice)} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid Listings */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 pt-12">
            {cardListings.length > 0 ? (
              cardListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            ) : largeListings.length === 0 ? (
              <div className="col-span-full px-6 py-12 text-center text-sm uppercase tracking-[0.18em] text-text-muted">
                Listings return shortly. Preparing the next showcase.
              </div>
            ) : null}
          </div>
        </SiteContainer>
      </section>
    </div>
  )
}
