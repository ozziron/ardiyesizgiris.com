import crypto from "crypto"

const STRIPE_API_BASE = "https://api.stripe.com/v1"

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
}

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    appUrl: getAppUrl(),
  }
}

export async function createPremiumCheckoutSession(input: {
  userId: string
  email?: string | null
}) {
  const config = getStripeConfig()

  if (!config.secretKey || !config.premiumPriceId) {
    throw new Error("Stripe ödeme ayarları eksik. STRIPE_SECRET_KEY ve STRIPE_PREMIUM_PRICE_ID tanımlanmalı.")
  }

  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": config.premiumPriceId,
    "line_items[0][quantity]": "1",
    client_reference_id: input.userId,
    success_url: `${config.appUrl}/hesaplama?checkout=success`,
    cancel_url: `${config.appUrl}/hesaplama?checkout=cancelled`,
    "metadata[userId]": input.userId,
  })

  if (input.email) {
    params.set("customer_email", input.email)
  }

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || "Stripe Checkout oturumu oluşturulamadı.")
  }

  return data as { id: string; url: string | null }
}

export function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const timestamp = signatureHeader
    .split(",")
    .find((part) => part.startsWith("t="))
    ?.slice(2)
  const signatures = signatureHeader
    .split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))

  if (!timestamp || signatures.length === 0) {
    return false
  }

  const signedPayload = `${timestamp}.${payload}`
  const expectedSignature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex")

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    return signatureBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  })
}
