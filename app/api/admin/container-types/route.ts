import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { containerTypeFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }
  return session
}

/**
 * GET — list ALL container types (including inactive ones) so the admin
 * UI can show soft-deleted types as well. Public /api/container-types
 * filters out inactives for use in the calculation form.
 */
export async function GET() {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }

  try {
    const types = await prisma.containerType.findMany({
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    })
    return NextResponse.json({ data: types })
  } catch (error) {
    console.error("Container types fetch error:", error)
    return NextResponse.json(
      { error: "Ekipman tipleri alınamadı" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = containerTypeFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Geçersiz veri" },
        { status: 400 }
      )
    }

    // Reject duplicate codes early with a friendlier message than the
    // Prisma unique-violation error.
    const existing = await prisma.containerType.findUnique({
      where: { code: validation.data.code },
    })
    if (existing) {
      return NextResponse.json(
        { error: `Bu kod (${validation.data.code}) zaten kullanılıyor` },
        { status: 400 }
      )
    }

    const type = await prisma.containerType.create({
      data: {
        ...validation.data,
        notes: validation.data.notes || null,
        createdBy: session.user?.id ?? null,
      },
    })

    return NextResponse.json({ data: type }, { status: 201 })
  } catch (error) {
    console.error("Container type create error:", error)
    return NextResponse.json(
      { error: "Ekipman tipi oluşturulamadı" },
      { status: 500 }
    )
  }
}
