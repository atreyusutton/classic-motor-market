import { prisma } from "@/lib/prisma"
import { ListingCard } from "@/components/listing/listing-card"
import { auth } from "@/auth"
import { SiteContainer } from "@/components/layout/site-container"
import { shouldShowAsPlaceholder, createPlaceholderListing } from "@/lib/listing-utils"

export const dynamic = "force-dynamic"

export default async function BrowsePage() {
  const session = await auth()
  const isMember = session?.user?.membershipStatus === "member" || Boolean(session?.user?.isAdmin)

  // Get all active listings (including early access ones)
  const activeListingsRaw = await prisma.listing.findMany({
    where: {
      listingStatus: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  // Transform early access listings to placeholders for non-members
  const activeListings = activeListingsRaw.map((listing) => {
    if (shouldShowAsPlaceholder(listing, isMember)) {
      return createPlaceholderListing(listing)
    }
    return listing
  })

  const soldListings = await prisma.listing.findMany({
    where: {
      listingStatus: "sold",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  return (
    <div className="bg-page py-12 md:py-16">
      <SiteContainer className="space-y-10">
        <div className="flex flex-col gap-4 border-b border-border-soft pb-6">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl text-brand-dark">Classic Motor Market Catalog</h1>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
              Become a member to view listings as they go live. Non-members can see the full listing after 10 minutes.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Active Listings Section */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-brand-dark pb-3">Available Vehicles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeListings.length > 0 ? (
                activeListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
              ) : (
                <div className="col-span-full px-6 py-12 text-center text-xs uppercase tracking-[0.18em] text-text-muted">
                  No vehicles available. New consignments arrive shortly.
                </div>
              )}
            </div>
          </div>

          {/* Sold Listings Section */}
          {soldListings.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-brand-dark pb-3">Recently Sold</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {soldListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}
        </div>
      </SiteContainer>
    </div>
  )
}
