import { prisma } from "@/lib/prisma"
import { ListingCard } from "@/components/listing/listing-card"
import { auth } from "@/auth"
import { SiteContainer } from "@/components/layout/site-container"

export const dynamic = "force-dynamic"

export default async function BrowsePage() {
  const session = await auth()
  const isMember = session?.user?.membershipStatus === "member" || session?.user?.isAdmin
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const listings = await prisma.listing.findMany({
    where: {
      listingStatus: "active",
      ...(!isMember
        ? {
            createdAt: {
              lte: fortyEightHoursAgo,
            },
          }
        : {}),
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
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
              Become a member to view listings as they go live. Non-members can see the full listing after 48 hours.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.length > 0 ? (
            listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
          ) : (
            <div className="col-span-full border border-dashed border-border-strong px-6 py-12 text-center text-xs uppercase tracking-[0.35em] text-text-muted">
              No vehicles match your filters. New consignments arrive shortly.
            </div>
          )}
        </div>
      </SiteContainer>
    </div>
  )
}
