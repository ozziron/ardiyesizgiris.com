import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  if (!token || !email) {
    return NextResponse.redirect(`${baseUrl}/eposta-onay?status=invalid`)
  }

  try {
    // Find the token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(`${baseUrl}/eposta-onay?status=invalid`)
    }

    // Check if the token matches the provided email
    if (verificationToken.identifier !== email) {
      return NextResponse.redirect(`${baseUrl}/eposta-onay?status=invalid`)
    }

    // Check if the token has expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } }).catch(() => null)
      return NextResponse.redirect(`${baseUrl}/eposta-onay?status=expired`)
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    })

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null)

    return NextResponse.redirect(`${baseUrl}/eposta-onay?status=success`)
  } catch (error) {
    console.error("[verify-email] Hata:", error)
    return NextResponse.redirect(`${baseUrl}/eposta-onay?status=invalid`)
  }
}
