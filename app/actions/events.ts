"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const eventSchema = z.object({
  title: z.string().min(2, "Title is required"),
  shortTitle: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) return { error: "Unauthorized" as const }
  return { session }
}

function parseForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    shortTitle: formData.get("shortTitle") || null,
    date: formData.get("date"),
  })
}

export async function createEvent(formData: FormData) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const d = parsed.data
  await prisma.event.create({
    data: {
      title: d.title,
      shortTitle: d.shortTitle || null,
      date: new Date(d.date),
      active: true,
    },
  })

  revalidatePath("/admin/events")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function updateEvent(id: number, formData: FormData) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const parsed = parseForm(formData)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const d = parsed.data
  await prisma.event.update({
    where: { id },
    data: {
      title: d.title,
      shortTitle: d.shortTitle || null,
      date: new Date(d.date),
    },
  })

  revalidatePath("/admin/events")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function toggleEventActive(id: number) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  const event = await prisma.event.findUnique({ where: { id }, select: { active: true } })
  if (!event) return { error: "Event not found" }

  await prisma.event.update({ where: { id }, data: { active: !event.active } })
  revalidatePath("/admin/events")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deleteEvent(id: number) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard

  await prisma.event.delete({ where: { id } })
  revalidatePath("/admin/events")
  revalidatePath("/", "layout")
  return { success: true }
}
