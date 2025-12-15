"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleFeatured(listingId: number) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" }
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { featured: true }
    })

    if (!listing) return { error: "Listing not found" }

    await prisma.listing.update({
      where: { id: listingId },
      data: { featured: !listing.featured }
    })

    revalidatePath("/admin/listings")
    revalidatePath("/") // Update homepage
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to update listing" }
  }
}

export async function updateUserRole(userId: number, isAdmin: boolean) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" }
  }

  // Prevent admin from removing their own admin status
  if (parseInt(session.user.id!) === userId && !isAdmin) {
      return { error: "Cannot remove your own admin status" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update user role" }
  }
}

export async function deleteUser(userId: number) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" }
  }

  // Prevent admin from deleting themselves
  if (parseInt(session.user.id!) === userId) {
      return { error: "Cannot delete your own account" }
  }

  try {
    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete user" }
  }
}

