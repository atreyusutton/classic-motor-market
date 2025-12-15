"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { listingSchema } from "@/lib/validations/listing"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { init } from "@paralleldrive/cuid2"
import { generateListingSlug } from "@/lib/utils"

const createShortId = init({ length: 6 })

// Helper to delete Cloudflare image
async function deleteCloudflareImage(url: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) return;

  // Extract ID from URL: https://imagedelivery.net/<hash>/<id>/<variant>
  const parts = url.split('/');
  const imageId = parts[parts.length - 2];

  if (!imageId) return;

  try {
    await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        }
    );
  } catch (e) {
    console.error("Failed to delete CF image", e)
  }
}

type ListingIntent = "draft" | "publish"

export async function createListing(rawData: z.infer<typeof listingSchema>, intent: ListingIntent = "draft") {
  const session = await auth()

  let userId: number | undefined

  if (session?.user?.id) {
    userId = parseInt(session.user.id)
  } else if (session?.user?.email) {
    // Fallback: lookup user by email if ID is missing in session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) {
      userId = user.id
    }
  }

  if (!userId) {
    return { error: "Not authenticated" }
  }

  const validatedFields = listingSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { images, publishFeeConfirmed, ...listingData } = validatedFields.data

  const isPublishing = intent === "publish"

  if (isPublishing && !publishFeeConfirmed) {
    return { error: "Publishing requires payment confirmation" }
  }

  const normalizedListingData = {
    ...listingData,
    askingPrice: Math.round(listingData.askingPrice * 100),
    vehicleIdentifier: listingData.vehicleIdentifier?.trim(),
    location: listingData.location?.trim(),
    optionsAndFeatures: listingData.optionsAndFeatures?.trim() || null,
    modifications: listingData.modifications?.trim() || null,
    vehicleHistory: listingData.vehicleHistory?.trim(),
    maintenanceHistory: listingData.maintenanceHistory?.trim(),
  }

  try {
    if (rawData.id) {
        // Update existing listing
        // Verify ownership first
        const existing = await prisma.listing.findUnique({ 
            where: { id: rawData.id },
            include: { media: true }
        })
        if (!existing || existing.sellerId !== userId) { // Add admin check if needed
             return { error: "Unauthorized or not found" }
        }

        // Reconcile images:
        // 1. Identify images to delete (in DB but not in new list)
        const imagesToDelete = existing.media.filter(m => !images.includes(m.providerId));
        
        // 2. Delete removed images from Cloudflare
        await Promise.all(imagesToDelete.map(m => deleteCloudflareImage(m.providerId)));

        // 3. Delete removed images from DB
        if (imagesToDelete.length > 0) {
            await prisma.listingMedia.deleteMany({
                where: { id: { in: imagesToDelete.map(m => m.id) } }
            });
        }

        // 4. Update the listing (and add new images)
        // We delete all remaining media relations and recreate them to ensure sort order is correct
        // OR we can just update existing and create new.
        // Simpler approach for sort order:
        // Delete ALL media for this listing in DB (we already deleted files for *removed* ones from CF)
        // Then re-create all media entries from the new list.
        // Note: We don't delete the *files* from CF for the ones that are kept, just the DB records.

        // Actually, deleting all DB records is safer for sort order.
        // We already handled CF deletion for the ones effectively removed.
        const imagesToKeep = existing.media.filter(m => images.includes(m.providerId));
        // We don't delete files for imagesToKeep.

        // Delete all DB media records for this listing to reset
        await prisma.listingMedia.deleteMany({
            where: { listingId: rawData.id }
        });

        const now = new Date()
        const updatedListing = await prisma.listing.update({
          where: { id: rawData.id },
          data: {
            ...normalizedListingData,
            listingStatus: isPublishing ? "active" : existing.listingStatus,
            publishedAt: isPublishing ? (existing.publishedAt ?? now) : existing.publishedAt,
            publishFeePaid: isPublishing ? true : existing.publishFeePaid,
            publishFeePaidAt: isPublishing ? (existing.publishFeePaidAt ?? now) : existing.publishFeePaidAt,
            publishFeeMethod: isPublishing ? "placeholder_checkbox" : existing.publishFeeMethod,
            media: {
              create: images.map((url, index) => ({
                type: "image" as const,
                provider: "cloudflare_images" as const,
                providerId: url,
                sortOrder: index,
                isCover: index === 0,
              }))
            }
          }
        })

        revalidatePath("/account/listings")
        revalidatePath("/browse")
        revalidatePath(generateListingSlug(updatedListing as any))

        return { 
          success: true, 
          listingId: updatedListing.id, 
          listing: updatedListing,
          redirectPath: isPublishing ? generateListingSlug(updatedListing as any) : "/account/listings"
        }
    }

    const listing = await prisma.listing.create({
      data: {
        ...normalizedListingData,
        publicId: createShortId(),
        sellerId: userId,
        listingStatus: isPublishing ? "active" : "draft",
        publishedAt: isPublishing ? new Date() : null,
        publishFeePaid: isPublishing,
        publishFeePaidAt: isPublishing ? new Date() : null,
        publishFeeMethod: "placeholder_checkbox",
        media: {
          create: images.map((url, index) => ({
            type: "image" as const,
            provider: "cloudflare_images" as const,
            providerId: url,
            sortOrder: index,
            isCover: index === 0,
          }))
        }
      }
    })
    
    const listingSlug = generateListingSlug(listing as any)
    revalidatePath("/account/listings")
    revalidatePath("/browse")
    revalidatePath(listingSlug)

    return { 
      success: true, 
      listingId: listing.id, 
      listing,
      redirectPath: isPublishing ? listingSlug : "/account/listings"
    }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create listing" }
  }
}

// ...

export async function updateListingStatus(listingId: number, status: 'active' | 'sold' | 'draft') {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const userId = parseInt(session.user.id)
  const isAdmin = session.user.isAdmin

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) return { error: "Listing not found" }

    if (listing.sellerId !== userId && !isAdmin) {
      return { error: "Unauthorized" }
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { listingStatus: status }
    })

    revalidatePath(generateListingSlug(listing as any))
    revalidatePath("/account/listings")
    revalidatePath("/admin/listings")
    revalidatePath("/browse")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    return { error: "Failed to update status" }
  }
}

export async function updatePublishFeeStatus(listingId: number, paid: boolean) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const userId = parseInt(session.user.id)
  const isAdmin = session.user.isAdmin

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) return { error: "Listing not found" }
    if (listing.sellerId !== userId && !isAdmin) {
      return { error: "Unauthorized" }
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        publishFeePaid: paid,
        publishFeePaidAt: paid ? (listing.publishFeePaidAt ?? new Date()) : null,
        publishFeeMethod: paid ? "placeholder_checkbox" : listing.publishFeeMethod
      }
    })

    revalidatePath("/account/listings")
    revalidatePath("/admin/listings")
    revalidatePath(generateListingSlug(listing as any))

    return { success: true }
  } catch (error) {
    console.error("Publish fee toggle error:", error)
    return { error: "Failed to update payment state" }
  }
}

export async function deleteListing(listingId: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const userId = parseInt(session.user.id)
  const isAdmin = session.user.isAdmin

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { media: true }
    })

    if (!listing) return { error: "Listing not found" }

    if (listing.sellerId !== userId && !isAdmin) {
      return { error: "Unauthorized" }
    }

    // Delete images from Cloudflare
    await Promise.all(listing.media.map(media => 
      deleteCloudflareImage(media.providerId)
    ))

    // Delete from DB (cascade deletes media records)
    await prisma.listing.delete({
      where: { id: listingId }
    })

    revalidatePath("/account/listings")
    revalidatePath("/admin/listings")
    revalidatePath("/browse")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    return { error: "Failed to delete listing" }
  }
}
