import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { carrierSurchargeFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }

  try {
    const surcharges = await prisma.carrierSurcharge.findMany({
      include: {
        shippingCompany: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ shippingCompanyId: "asc" }, { name: "asc" }],
    })
    return NextResponse.json({ data: surcharges })
  } catch (error) {
    console.error("Carrier surcharges fetch error:", error)
    return NextResponse.json(
      { error: "Ek ücretler alınamadı" },
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
    const validation = carrierSurchargeFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Geçersiz veri" },
        { status: 400 }
      )
    }

    const surcharge = await prisma.carrierSurcharge.create({
      data: {
        ...validation.data,
        description: validation.data.description || null,
      },
    })

    return NextResponse.json({ data: surcharge }, { status: 201 })
  } catch (error) {
    console.error("Carrier surcharge create error:", error)
    return NextResponse.json(
      { error: "Ek ücret oluşturulamadı" },
      { status: 500 }
    )
  }
}
