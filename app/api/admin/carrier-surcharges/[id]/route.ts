import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { carrierSurchargeFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { id } = await params
  try {
    const surcharge = await prisma.carrierSurcharge.findUnique({
      where: { id },
      include: {
        shippingCompany: { select: { id: true, name: true, code: true } },
      },
    })
    if (!surcharge) {
      return NextResponse.json({ error: "Ek ücret bulunamadı" }, { status: 404 })
    }
    return NextResponse.json({ data: surcharge })
  } catch (error) {
    console.error("Carrier surcharge get error:", error)
    return NextResponse.json({ error: "Ek ücret alınamadı" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const validation = carrierSurchargeFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Geçersiz veri" },
        { status: 400 }
      )
    }

    const surcharge = await prisma.carrierSurcharge.update({
      where: { id },
      data: {
        ...validation.data,
        description: validation.data.description || null,
      },
    })

    return NextResponse.json({ data: surcharge })
  } catch (error) {
    console.error("Carrier surcharge update error:", error)
    return NextResponse.json({ error: "Ek ücret güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.carrierSurcharge.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Carrier surcharge delete error:", error)
    return NextResponse.json({ error: "Ek ücret silinemedi" }, { status: 500 })
  }
}
