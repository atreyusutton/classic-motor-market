import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ListingWizard } from "@/components/listing/listing-wizard"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { listingSchema } from "@/lib/validations/listing"

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params
  const listingId = parseInt(id)

  if (isNaN(listingId)) notFound()

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!listing) notFound()

  // Ensure user owns the listing or is an admin
  if (listing.sellerId !== parseInt(session.user.id) && !session.user.isAdmin) {
    redirect("/account/listings")
  }

  const initialData: z.infer<typeof listingSchema> & { id: number; publishFeePaid?: boolean } = {
    id: listing.id,
    year: listing.year ?? (undefined as any),
    make: listing.make ?? "",
    model: listing.model ?? "",
    vehicleIdentifier: listing.vehicleIdentifier ?? "",
    location: listing.location ?? "",
    mileage: listing.mileage ?? 0,
    exteriorColor: listing.exteriorColor ?? "",
    interiorColorMaterial: listing.interiorColorMaterial ?? "",
    engine: listing.engine ?? "",
    transmission: listing.transmission ?? "",
    askingPrice: listing.askingPrice ?? 0,
    optionsAndFeatures: listing.optionsAndFeatures ?? "",
    modifications: listing.modifications ?? "",
    conditionGrade: (listing.conditionGrade as any) ?? "driver",
    vehicleHistory: listing.vehicleHistory ?? "",
    maintenanceHistory: listing.maintenanceHistory ?? "",
    titleStatus: listing.titleStatus ?? undefined,
    carfaxAvailable: listing.carfaxAvailable ?? false,
    images: listing.media.map((m) => m.providerId),
    publishFeeConfirmed: listing.publishFeePaid,
  }

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
        <p className="text-muted-foreground mt-2">
          Update details for your {listing.year} {listing.make} {listing.model}
        </p>
      </div>
      {/* @ts-ignore */}
      <ListingWizard initialData={initialData} />
    </div>
  )
}

