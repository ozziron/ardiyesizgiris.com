import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }

  const body = await request.json()
  const validation = schema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = validation.data

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, passwordHash: true },
  })

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 })
  }

  // Hash and save new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  })

  return NextResponse.json({ success: true })
}
