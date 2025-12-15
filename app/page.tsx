import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ListingCard } from "@/components/listing/listing-card"
import { auth } from "@/auth"
import { SiteContainer } from "@/components/layout/site-container"

export const dynamic = "force-dynamic"

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
  const cutoffDate = new Date(Date.now() - 5 * 60 * 1000)

  const visibilityFilter = !isMember ? { createdAt: { lte: cutoffDate } } : {}

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
      <section className="relative isolate min-h-[90vh] overflow-hidden">
        <Image
          src="/assets/hero-porsche.png"
          alt="Classic touring car"
          fill
          priority
          className="object-cover"
        />
        <SiteContainer className="relative flex min-h-[90vh] flex-col items-center justify-center gap-8 px-4 text-center text-white">
          <Image
            src="/assets/cmm-logo-white.png"
            alt="Classic Motor Market monogram"
            width={128}
            height={128}
            className="h-24 w-auto"
            priority
          />
          <div className="max-w-3xl space-y-6">
            <h1 className="font-serif text-4xl font-semibold leading-tight italic text-brand-gold sm:text-5xl lg:text-6xl md:whitespace-nowrap">
              Drive your next adventure...
            </h1>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white">
              Classic Motor Market is an affordable member-driven sales platform for European enthusiast vehicles.
            </p>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white">
              Built by car enthusiasts for car enthusiasts.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/listings">Browse Listings</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[200px] border-white/70 text-white hover:bg-white/10"
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

      <section className="bg-page py-16 md:py-20">
        <SiteContainer className="grid gap-12">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Image
              src="/assets/ff-logo.png"
              alt="Fuelfed logo"
              width={140}
              height={140}
              className="h-20 w-auto"
            />
            <div className="h-px w-16 bg-border-strong sm:h-16 sm:w-px" />
            <Image
              src="/assets/cmm-logo-blue.png"
              alt="Classic Motor Market logo"
              width={140}
              height={140}
              className="h-20 w-auto"
            />
          </div>
          <div className="space-y-5 text-sm leading-relaxed text-brand-dark">
            <p className="font-serif text-2xl text-brand-dark">
              From the founders of the revered classic European car club, Fuelfed, comes a new platform allowing you to
              take control of the sales experience.
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
                <span className="font-bold text-brand-dark">No destructive comments.</span> No permanent digital
                footprint, no low reserves.
              </p>
            </div>
            <Button asChild className="uppercase tracking-[0.35em]">
              <Link href="/sell">List Vehicle</Link>
            </Button>
          </div>
        </SiteContainer>
      </section>

      <section className="bg-page-alt py-16 text-center">
        <SiteContainer className="space-y-6">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-brand-dark">
            Membership · $49 yearly
          </p>
          <h3 className="font-serif text-3xl text-brand-dark">
            Serious conversations only. A single annual due keeps the tire-kickers away.
          </h3>
          <div className="grid gap-4 text-xs uppercase tracking-[0.35em] text-brand-dark/80 md:grid-cols-2 lg:grid-cols-3">
            {membershipBenefits.map((benefit) => (
              <div key={benefit} className="border border-border-soft bg-card px-4 py-6">
                {benefit}
              </div>
            ))}
          </div>
          <Button asChild variant="secondary">
            <Link href="/register">Become a Member</Link>
          </Button>
        </SiteContainer>
      </section>

      <section className="bg-page py-20">
        <SiteContainer>
          <div className="flex flex-col gap-4 border-b border-border-soft pb-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div className="space-y-2">
              <p className="font-serif text-xs uppercase tracking-[0.5em] text-brand-dark">
                Member Listings
              </p>
              <h4 className="font-serif text-3xl text-brand-dark">
                Hand-picked vehicles presently inside the showroom
              </h4>
              <p className="text-sm uppercase tracking-[0.35em] text-text-muted">
                One-column on mobile, three on desktop. No clutter, just cars.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/listings">View the catalogue</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
