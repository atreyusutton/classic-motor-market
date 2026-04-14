"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const adSchema = z.object({
  name: z.string().min(1, "Name is required"),
  placement: z.enum(["home", "card", "detail"]),
  url: z.string().url("Valid URL required"),
  desktopImageId: z.string().min(1, "Desktop image required"),
  mobileImageId: z.string().min(1, "Mobile image required"),
  active: z.boolean().default(true),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) return { error: "Unauthorized" as const }
  return { session }
}

async function deleteCloudflareImage(imageId: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !token || !imageId) return
  try {
    await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (e) {
    console.error("Failed to delete Cloudflare image", e)
  }
}

type AdInput = z.infer<typeof adSchema>

export async function createAd(input: AdInput) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const parsed = adSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  await prisma.ad.create({ data: parsed.data })
  revalidatePath("/admin/ads")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateAd(id: number, input: AdInput) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const parsed = adSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const existing = await prisma.ad.findUnique({ where: { id } })
  if (!existing) return { error: "Ad not found" }

  if (existing.desktopImageId && existing.desktopImageId !== parsed.data.desktopImageId) {
    await deleteCloudflareImage(existing.desktopImageId)
  }
  if (existing.mobileImageId && existing.mobileImageId !== parsed.data.mobileImageId) {
    await deleteCloudflareImage(existing.mobileImageId)
  }

  await prisma.ad.update({ where: { id }, data: parsed.data })
  revalidatePath("/admin/ads")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function toggleAdActive(id: number) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const ad = await prisma.ad.findUnique({ where: { id }, select: { active: true } })
  if (!ad) return { error: "Ad not found" }

  await prisma.ad.update({ where: { id }, data: { active: !ad.active } })
  revalidatePath("/admin/ads")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deleteAd(id: number) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const ad = await prisma.ad.findUnique({ where: { id } })
  if (!ad) return { error: "Ad not found" }

  await deleteCloudflareImage(ad.desktopImageId)
  await deleteCloudflareImage(ad.mobileImageId)
  await prisma.ad.delete({ where: { id } })

  revalidatePath("/admin/ads")
  revalidatePath("/", "layout")
  return { success: true }
}
