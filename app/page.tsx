import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listing/listing-card"
import { auth } from "@/auth"
import { SiteContainer } from "@/components/layout/site-container"
import { cn, getCloudflareImageUrl, formatCurrency, generateListingSlug } from "@/lib/utils"
import { MembershipBenefits } from "@/components/membership-benefits"
import { shouldShowAsPlaceholder, createPlaceholderListing } from "@/lib/listing-utils"
import { MemberListingsBanner } from "@/components/listing/member-listings-banner"
import { AdSlot } from "@/components/ads/ad-slot"

export const dynamic = "force-dynamic"

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-soft pb-3">
      <span className="text-[0.5rem] sm:text-xs text-text-muted">{label}</span>
      <span className="font-serif text-sm sm:text-base normal-case tracking-normal text-brand-dark">{value}</span>
    </div>
  )
}

export default async function Home() {
  const session = await auth()
  const isMember = !!session?.user

  const featuredListingsRaw = await prisma.listing.findMany({
    where: {
      listingStatus: "active",
      featured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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
        listingStatus: "active",
        featured: false,
        id: { notIn: featuredListings.map((l) => l.id) },
      },
      orderBy: {
        createdAt: "desc",
      },
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
            <p className="font-serif text-lg sm:text-xl md:text-2xl leading-relaxed text-white drop-shadow-md">
              Classic Motor Market is an affordable member-driven sales platform for European enthusiast vehicles.
            </p>
            <p className="font-serif text-lg sm:text-xl md:text-2xl leading-relaxed text-white drop-shadow-md">
              Built by car enthusiasts for car enthusiasts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto px-2">
            <Button asChild size="lg" className="h-9 sm:h-12 px-4 sm:px-10 text-[0.6rem] sm:text-base min-w-[130px] sm:min-w-[200px] bg-transparent text-white border border-white transition-all duration-300 hover:bg-white/15 hover:shadow-lg">
              <Link href="/listings">Browse Listings</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-9 sm:h-12 px-4 sm:px-10 text-[0.6rem] sm:text-base min-w-[130px] sm:min-w-[200px] bg-transparent text-white border border-white transition-all duration-300 hover:bg-white/15 hover:shadow-lg"
            >
              <Link href="/sell">List a Vehicle</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      <div className="h-1 w-full bg-white/60" />

      <section className="relative min-h-[32rem] w-full overflow-hidden">
        <Image
          src="/assets/hero-line.png"
          alt="Lifestyle imagery"
          fill
          className="object-cover object-[center_20%] saturate-50 brightness-[0.45]"
        />
        <SiteContainer className="relative flex min-h-[32rem] flex-col items-center justify-center gap-6 sm:gap-8 px-6 sm:px-8 text-center text-white">
          <div className="flex items-center gap-3 sm:gap-5">
            <Image
              src="/assets/ff-logo.png"
              alt="Fuelfed logo"
              width={140}
              height={140}
              className="h-14 sm:h-20 w-auto"
            />
            <div className="h-12 sm:h-16 w-px bg-white/40" />
            <Image
              src="/assets/cmm-logo-white.png"
              alt="Classic Motor Market logo"
              width={140}
              height={140}
              className="h-14 sm:h-20 w-auto"
            />
          </div>
          <p className="font-serif text-lg sm:text-xl md:text-2xl max-w-3xl leading-relaxed text-white drop-shadow-md">
            From the Founders of the classic European car club, Fuelfed, comes a new sales platform for classic and enthusiast European vehicles. Take back control of the sales process with Classic Motor Market.
          </p>
        </SiteContainer>
      </section>

      {/* Spacer */}
      <div className="h-6 sm:h-10 bg-white" />

      {/* Benefits Banner — tan background matching listings */}
      <section className="bg-page py-10 sm:py-14">
        <SiteContainer>
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src="/assets/cmm-logo-blue.png"
              alt="Classic Motor Market logo"
              width={80}
              height={80}
              className="h-12 sm:h-16 w-auto flex-shrink-0"
            />
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-brand-dark">
              Benefits of becoming a Classic Motor Market Member
            </h2>
          </div>
        </SiteContainer>
      </section>

      {/* Accordion + CTA — white background */}
      <section className="bg-white py-10 sm:py-14">
        <SiteContainer className="space-y-8 sm:space-y-10">
          <MembershipBenefits />

          <div className="pt-2">
            <Button asChild className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base bg-brand-gold text-brand-dark hover:bg-brand-gold/90 uppercase tracking-[0.18em] font-semibold">
              <Link href="/register">Start your Membership</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      <MemberListingsBanner />

      <section className="bg-page py-12 sm:py-16 md:py-20 border-t border-border-soft/30">
        <SiteContainer className="space-y-12 sm:space-y-20">
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
                    <div className="space-y-8">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-page-alt p-4 sm:p-6 text-sm sm:text-base uppercase tracking-[0.1em] sm:tracking-[0.12em] text-brand-dark/80">
                        <SpecRow label="Engine" value={listing.engine || "—"} />
                        <SpecRow label="Transmission" value={listing.transmission || "—"} />
                        <SpecRow label="Exterior" value={listing.exteriorColor || "—"} />
                        <SpecRow label="Interior" value={listing.interiorColorMaterial || "—"} />
                        <SpecRow label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} miles` : "—"} />
                        <SpecRow label="Location" value={isEarlyAccess ? "Member Exclusive" : (listing.location || "Private")} />
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

          {/* Sponsored */}
          <div className="pt-8 sm:pt-12">
            <AdSlot placement="home" className="mx-auto max-w-5xl" />
          </div>

          {/* Browse Vehicles CTA */}
          <div className="flex justify-center pt-8 sm:pt-12">
            <Button asChild size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base bg-brand-dark text-white hover:bg-brand-dark/90 uppercase tracking-[0.18em] font-semibold">
              <Link href="/listings">Browse Vehicles</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>
    </div>
  )
}
