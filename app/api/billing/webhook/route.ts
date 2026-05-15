import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getStripeConfig, verifyStripeSignature } from "@/lib/billing/stripe"

export const runtime = "nodejs"

type StripeCheckoutSession = {
  id: string
  client_reference_id?: string | null
  metadata?: {
    userId?: string
  }
}

type StripeEvent = {
  type: string
  data: {
    object: StripeCheckoutSession
  }
}

export async function POST(request: Request) {
  const config = getStripeConfig()

  if (!config.webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET tanımlı değil." },
      { status: 500 },
    )
  }

  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature || !verifyStripeSignature(payload, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Geçersiz Stripe imzası." }, { status: 400 })
  }

  const event = JSON.parse(payload) as StripeEvent

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object
    const userId = checkoutSession.client_reference_id || checkoutSession.metadata?.userId

    if (userId) {
      await prisma.user.updateMany({
        where: { id: userId },
        data: {
          membershipType: "PREMIUM",
          subscriptionActive: true,
          subscriptionEndDate: null,
          freeUsageRemaining: 0,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
