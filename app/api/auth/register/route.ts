import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email/send-verification-email"

const registerSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  name: z.string().optional(),
  companyName: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Hizmet Sözleşmesi ve KVKK Aydınlatma Metni kabul edilmelidir" }),
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email zaten kayıtlı" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(validatedData.password, 10)

    // Create user — emailVerified stays null until they confirm the link
    const termsVersion = process.env.TERMS_VERSION ?? "1.0"
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        name: validatedData.name,
        companyName: validatedData.companyName,
        role: "USER",
        membershipType: "FREE",
        emailVerified: null,
        termsAcceptedAt: new Date(),
        termsVersion,
      },
    })

    // Generate a secure verification token valid for 24 hours
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token,
        expires,
      },
    })

    // Build verification URL and send email — graceful failure
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(validatedData.email)}`

    let emailWarning: string | null = null
    try {
      const emailResult = await sendVerificationEmail(
        validatedData.email,
        verificationUrl,
        validatedData.name
      )
      if (emailResult.status === "not_configured") {
        console.warn("[register] Email servis yapılandırılmamış:", emailResult.reason)
        emailWarning = "Email gönderimi henüz aktif değil. Doğrulama linkini manuel olarak talep edebilirsiniz."
      } else if (emailResult.status === "dry_run") {
        console.log("[register] Dry-run mod: email gönderilmedi, kayıt başarılı.")
      }
    } catch (emailError) {
      console.warn("[register] Verification email gönderilemedi:", emailError)
      emailWarning = "Doğrulama emaili gönderilemedi. Lütfen giriş sayfasından tekrar göndermeyi deneyin."
    }

    return NextResponse.json(
      {
        success: true,
        emailPending: true,
        emailWarning,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
