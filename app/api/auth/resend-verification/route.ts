import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import crypto from "crypto"
import { z } from "zod"
import { sendVerificationEmail } from "@/lib/email/send-verification-email"

const resendSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })

    // Return success even if user not found to avoid enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Bu email adresi zaten doğrulanmış." },
        { status: 400 }
      )
    }

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Generate a new token valid for 24 hours
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    try {
      await sendVerificationEmail(email, verificationUrl, user.name)
    } catch (emailError) {
      console.warn("[resend-verification] Email gönderilemedi:", emailError)
      return NextResponse.json(
        { error: "Doğrulama emaili gönderilemedi. Lütfen daha sonra tekrar deneyin." },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz email adresi" },
        { status: 400 }
      )
    }

    console.error("[resend-verification] Hata:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    )
  }
}
