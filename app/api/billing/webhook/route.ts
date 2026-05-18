import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getStripeConfig, verifyStripeSignature } from "@/lib/billing/stripe"
import { BILLING_ENABLED } from "@/lib/billing/config"

export const runtime = "nodejs"

type StripeCheckoutSession = {
  id: string
  mode?: string
  client_reference_id?: string | null
  metadata?: {
    userId?: string
    type?: string
    credits?: string
  }
}

type StripeEvent = {
  type: string
  data: {
    object: StripeCheckoutSession
  }
}

export async function POST(request: Request) {
  if (!BILLING_ENABLED) {
    return NextResponse.json(
      { error: "Ödeme sistemi şu anda devre dışı." },
      { status: 503 },
    )
  }

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

    if (!userId) return NextResponse.json({ received: true })

    const isCreditPurchase =
      checkoutSession.metadata?.type === "credit_pack" || checkoutSession.mode === "payment"

    if (isCreditPurchase) {
      const credits = parseInt(checkoutSession.metadata?.credits || "10", 10)
      await prisma.user.updateMany({
        where: { id: userId },
        data: {
          freeUsageRemaining: { increment: credits },
        },
      })
    } else {
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
