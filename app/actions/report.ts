"use server"

import { auth } from "@/auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function reportListing(listingId: number) {
  const session = await auth()

  try {
    const userEmail = session?.user?.email || "Anonymous"
    const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vehicles/${listingId}`

    if (!process.env.RESEND_API_KEY) {
        console.log("DEMO MODE: Report email would be sent.")
        console.log(`Reporting Listing ID: ${listingId}`)
        console.log(`Reporter: ${userEmail}`)
        return { success: true }
    }

    // In a real app, send to admin email or support ticketing system
    await resend.emails.send({
      from: 'Classic Motor Market <onboarding@resend.dev>',
      to: ['admin@classicmotormarket.com'], // Replace with actual admin email
      subject: `Report: Listing #${listingId}`,
      text: `
A user has reported a listing.

Listing ID: ${listingId}
URL: ${listingUrl}
Reporter: ${userEmail}

Please review this listing for policy violations.
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Report error:", error)
    return { error: "Failed to submit report" }
  }
}

