import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { createPremiumCheckoutSession } from "@/lib/billing/stripe"
import { BILLING_ENABLED } from "@/lib/billing/config"

export const runtime = "nodejs"

export async function POST() {
  if (!BILLING_ENABLED) {
    return NextResponse.json(
      { error: "Ödeme sistemi şu anda devre dışı." },
      { status: 503 },
    )
  }

  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Premium'a geçmek için giriş yapmalısınız." },
      { status: 401 },
    )
  }

  try {
    const checkoutSession = await createPremiumCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
    })

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe Checkout oturumu oluşturulamadı.",
      },
      { status: 500 },
    )
  }
}
