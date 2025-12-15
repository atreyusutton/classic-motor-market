"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactDetails {
  name: string
  email: string
  phone?: string
  message: string
}

export async function contactSeller(listingId: number, details: ContactDetails) {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "You must be logged in to contact a seller." }
  }

  // Ensure message is not empty (double check validation)
  if (!details.message || !details.name || !details.email) {
      return { error: "Missing required fields." }
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: { email: true, name: true }
        }
      }
    })

    if (!listing) {
      return { error: "Listing not found." }
    }

    if (!listing.seller.email) {
        return { error: "Seller email not configured." }
    }

    // Check for API key (demo mode check)
    if (!process.env.RESEND_API_KEY) {
        console.log("DEMO MODE: Email would be sent here.")
        console.log(`To: ${listing.seller.email}`)
        console.log(`Reply-To: ${details.email}`)
        console.log(`From Details: ${details.name}, Phone: ${details.phone || 'N/A'}`)
        console.log(`Message: ${details.message}`)
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return { success: true, demo: true }
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'Classic Motor Market <onboarding@resend.dev>', // Use verified domain in prod
      to: [listing.seller.email],
      replyTo: details.email,
      subject: `New inquiry for: ${listing.year} ${listing.make} ${listing.model}`,
      text: `
Hello ${listing.seller.name},

You have received a new inquiry from ${details.name} regarding your listing on Classic Motor Market.

Contact Details:
Name: ${details.name}
Email: ${details.email}
Phone: ${details.phone || 'Not provided'}

Message:
--------------------------------------------------
${details.message}
--------------------------------------------------

To reply, simply reply to this email (replies go to ${details.email}).

Best regards,
Classic Motor Market Team
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { error: "Failed to send email via provider." }
    }

    return { success: true }

  } catch (error) {
    console.error("Contact action error:", error)
    return { error: "Something went wrong." }
  }
}

