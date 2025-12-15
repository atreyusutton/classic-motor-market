"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleWatchlist(listingId: number) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const userId = parseInt(session.user.id)

  try {
    const existing = await prisma.savedListing.findFirst({
      where: {
        userId: userId,
        listingId: listingId,
      }
    })

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id }
      })
      revalidatePath(`/vehicles/${listingId}`)
      revalidatePath("/account/watchlist")
      return { success: true, saved: false }
    } else {
      await prisma.savedListing.create({
        data: {
          userId: userId,
          listingId: listingId,
        }
      })
      revalidatePath(`/vehicles/${listingId}`)
      revalidatePath("/account/watchlist")
      return { success: true, saved: true }
    }
  } catch (error) {
    console.error("Watchlist error:", error)
    return { error: "Failed to update watchlist" }
  }
}

