import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const MEMBERSHIP_PRICE_ID = "price_H5ggYJDqQeaReT" // Placeholder, we will create a one-time price dynamically if needed or use 'price_data'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(session.user.id)
      }
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    // For this demo, we'll create a checkout session for a membership
    // In a real app, you'd define products in Stripe Dashboard and use price IDs
    
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?canceled=true`,
      payment_method_types: ["card"],
      mode: "payment", // Use 'subscription' for recurring
      billing_address_collection: "auto",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Classic Motor Market Membership",
              description: "1 Year Membership - Access to exclusive listings and seller contact.",
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id.toString(),
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("[STRIPE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

