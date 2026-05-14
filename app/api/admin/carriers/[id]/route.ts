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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const carrier = await prisma.shippingCompany.findUnique({
      where: { id },
    })

    if (!carrier) {
      return NextResponse.json(
        { error: "Hat bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: carrier })
  } catch (error) {
    console.error("Carrier fetch error:", error)
    return NextResponse.json(
      { error: "Hat getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin()
    const { id } = await params

    const body = await request.json()
    const validation = carrierFormSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const existingCarrier = await prisma.shippingCompany.findUnique({
      where: { id },
    })

    if (!existingCarrier) {
      return NextResponse.json(
        { error: "Hat bulunamadı" },
        { status: 404 }
      )
    }

    // Check for duplicate code (if code changed)
    if (validation.data.code !== existingCarrier.code) {
      const duplicateCode = await prisma.shippingCompany.findFirst({
        where: { code: validation.data.code },
      })

      if (duplicateCode) {
        return NextResponse.json(
          { error: "Bu kod zaten kullanılıyor" },
          { status: 400 }
        )
      }
    }

    const updatedCarrier = await prisma.shippingCompany.update({
      where: { id },
      data: {
        name: validation.data.name,
        code: validation.data.code,
        isActive: validation.data.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedCarrier,
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    console.error("Carrier update error:", error)
    return NextResponse.json(
      { error: "Hat güncellenirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin()
    const { id } = await params

    const existingCarrier = await prisma.shippingCompany.findUnique({
      where: { id },
    })

    if (!existingCarrier) {
      return NextResponse.json(
        { error: "Hat bulunamadı" },
        { status: 404 }
      )
    }

    // Soft delete: set isActive to false
    await prisma.shippingCompany.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: "Hat başarıyla silindi",
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    console.error("Carrier delete error:", error)
    return NextResponse.json(
      { error: "Hat silinirken hata oluştu" },
      { status: 500 }
    )
  }
}
