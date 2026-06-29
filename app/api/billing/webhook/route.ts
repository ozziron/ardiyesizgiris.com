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

type StripeWebhookEvent = {
  id: string
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

  let event: StripeWebhookEvent
  try {
    event = JSON.parse(payload) as StripeWebhookEvent
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 })
  }

  // Idempotency: Stripe delivers events at-least-once. Track processed event
  // IDs so retries don't double-credit users or re-apply membership changes.
  const alreadyProcessed = await prisma.stripeEvent.findUnique({
    where: { stripeEventId: event.id },
    select: { id: true },
  })

  if (alreadyProcessed) {
    return NextResponse.json({ received: true })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object
      const userId = checkoutSession.client_reference_id || checkoutSession.metadata?.userId

      if (!userId) {
        // No user to act on — still record the event so we don't retry forever
        await prisma.stripeEvent.create({
          data: {
            stripeEventId: event.id,
            eventType: event.type,
          },
        })
        return NextResponse.json({ received: true })
      }

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

    // Record the event as processed so retries are safe
    await prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook işleme hatası:", error)
    // Return 500 so Stripe will retry — the idempotency guard above ensures
    // a partially-applied event won't double-apply on retry.
    return NextResponse.json(
      { error: "Webhook işlenirken sunucu hatası oluştu." },
      { status: 500 },
    )
  }
}
