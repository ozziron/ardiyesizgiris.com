import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { carrierFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }
}

export async function GET() {
  try {
    const carriers = await prisma.shippingCompany.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      data: carriers,
    })
  } catch (error) {
    console.error("Carriers fetch error:", error)
    return NextResponse.json(
      { error: "Hat bilgileri getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await checkAdmin()

    const body = await request.json()
    const validation = carrierFormSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existingCarrier = await prisma.shippingCompany.findFirst({
      where: { code: validation.data.code },
    })

    if (existingCarrier) {
      return NextResponse.json(
        { error: "Bu kod zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const carrier = await prisma.shippingCompany.create({
      data: {
        name: validation.data.name,
        code: validation.data.code,
        isActive: validation.data.isActive ?? true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: carrier,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    console.error("Carrier creation error:", error)
    return NextResponse.json(
      { error: "Hat oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
