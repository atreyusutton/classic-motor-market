import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listing/listing-card"
import { auth } from "@/auth"
import { SiteContainer } from "@/components/layout/site-container"

export const dynamic = "force-dynamic"

// Helper function to get cutoff date for non-members (avoids impurity in component)
const getCutoffDate = () => new Date(Date.now() - 48 * 60 * 60 * 1000)

const membershipBenefits = [
  "Discreet seller contact via relay",
  "48-hour early access to new listings",
  "Full VIN visibility for due diligence",
  "First listing included with membership",
  "Purchase vehicles without auction pressure",
  "Inspect and test drive on your schedule",
]

export default async function Home() {
  const session = await auth()
  const isMember = !!session?.user

  const visibilityFilter = !isMember ? { createdAt: { lte: getCutoffDate() } } : {}

  const featuredListings = await prisma.listing.findMany({
    where: {
      listingStatus: "active",
      featured: true,
      ...visibilityFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { media: { orderBy: { sortOrder: "asc" } } },
  })

  let displayListings = featuredListings
  if (featuredListings.length < 3) {
    const recentListings = await prisma.listing.findMany({
      where: {
        listingStatus: "active",
        featured: false,
        id: { notIn: featuredListings.map((l) => l.id) },
        ...visibilityFilter,
      },
      orderBy: { createdAt: "desc" },
      take: 3 - featuredListings.length,
      include: { media: { orderBy: { sortOrder: "asc" } } },
    })
    displayListings = [...featuredListings, ...recentListings]
  }

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[85vh] sm:min-h-[90vh] overflow-hidden">
        <Image
          src="/assets/hero-porsche.png"
          alt="Classic touring car"
          fill
          priority
          className="object-cover"
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
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight italic text-brand-gold">
              Drive your next adventure...
            </h1>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white">
              Classic Motor Market is an affordable member-driven sales platform for European enthusiast vehicles.
            </p>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white">
              Built by car enthusiasts for car enthusiasts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto px-2">
            <Button asChild size="lg" className="h-9 sm:h-12 px-4 sm:px-10 text-[0.6rem] sm:text-base min-w-[130px] sm:min-w-[200px]">
              <Link href="/listings">Browse Listings</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-9 sm:h-12 px-4 sm:px-10 text-[0.6rem] sm:text-base min-w-[130px] sm:min-w-[200px] border-white/70 text-white hover:bg-white/10"
            >
              <Link href="/sell">List An Automobile</Link>
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
            <Button asChild className="uppercase tracking-[0.35em]">
              <Link href="/sell">List Your Vehicle</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      <section className="bg-page-alt py-12 sm:py-16 text-center">
        <SiteContainer className="space-y-5 sm:space-y-6">
          <p className="font-serif text-[0.65rem] sm:text-xs uppercase tracking-[0.4em] sm:tracking-[0.5em] text-brand-dark">
            Membership · $49 yearly
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl text-brand-dark px-4">
          Why join a Classic Motor Market as a buyer?
          </h3>
          <div className="grid gap-3 sm:gap-4 text-[0.65rem] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-dark/80 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {membershipBenefits.map((benefit) => (
              <div key={benefit} className="border border-border-soft bg-card px-4 py-5 sm:py-6">
                {benefit}
              </div>
            ))}
          </div>
          <Button asChild variant="secondary" className="w-full sm:w-auto h-11 sm:h-12">
            <Link href="/register">Become a Member</Link>
          </Button>
        </SiteContainer>
      </section>

      <section className="bg-page py-12 sm:py-16 md:py-20">
        <SiteContainer>
          <div className="flex flex-col gap-4 border-b border-border-soft pb-6 sm:pb-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div className="space-y-2">
              <p className="font-serif text-[0.65rem] sm:text-xs uppercase tracking-[0.4em] sm:tracking-[0.5em] text-brand-dark">
                Member Listings
              </p>
              <h4 className="font-serif text-2xl sm:text-3xl text-brand-dark px-2 sm:px-0">
                Hand-picked vehicles presently inside the showroom
              </h4>
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.35em] text-text-muted">
                One-column on mobile, three on desktop. No clutter, just cars.
              </p>
            </div>
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/listings">View the catalogue</Link>
            </Button>
          </div>
          <div className="mt-6 sm:mt-8 md:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayListings.length > 0 ? (
              displayListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            ) : (
              <div className="col-span-full border border-dashed border-border-strong px-6 py-12 text-center text-sm uppercase tracking-[0.35em] text-text-muted">
                Listings return shortly. Preparing the next showcase.
              </div>
            )}
          </div>
        </SiteContainer>
      </section>
    </div>
  )
}
