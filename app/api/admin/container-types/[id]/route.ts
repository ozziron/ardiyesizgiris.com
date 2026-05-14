import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { containerTypeFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { id } = await params
  try {
    const type = await prisma.containerType.findUnique({ where: { id } })
    if (!type) {
      return NextResponse.json({ error: "Ekipman tipi bulunamadı" }, { status: 404 })
    }
    return NextResponse.json({ data: type })
  } catch (error) {
    console.error("Container type get error:", error)
    return NextResponse.json({ error: "Ekipman tipi alınamadı" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const validation = containerTypeFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Geçersiz veri" },
        { status: 400 }
      )
    }

    // If the user changed the code, make sure the new code is free.
    const codeOwner = await prisma.containerType.findUnique({
      where: { code: validation.data.code },
      select: { id: true },
    })
    if (codeOwner && codeOwner.id !== id) {
      return NextResponse.json(
        { error: `Bu kod (${validation.data.code}) başka bir tip için kullanılıyor` },
        { status: 400 }
      )
    }

    const type = await prisma.containerType.update({
      where: { id },
      data: {
        ...validation.data,
        notes: validation.data.notes || null,
      },
    })
    return NextResponse.json({ data: type })
  } catch (error) {
    console.error("Container type update error:", error)
    return NextResponse.json({ error: "Ekipman tipi güncellenemedi" }, { status: 500 })
  }
}

/**
 * DELETE — soft delete by default (isActive=false). Existing FreeTimeRule
 * and TariffRule rows that reference this type by `code` string keep
 * working; the type just disappears from new-rule selects.
 *
 * Pass ?hard=true to permanently delete (admin discretion — only safe
 * when no rule references this code).
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { id } = await params
  const url = new URL(request.url)
  const hard = url.searchParams.get("hard") === "true"

  try {
    if (hard) {
      await prisma.containerType.delete({ where: { id } })
    } else {
      await prisma.containerType.update({
        where: { id },
        data: { isActive: false },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Container type delete error:", error)
    return NextResponse.json({ error: "Ekipman tipi silinemedi" }, { status: 500 })
  }
}
