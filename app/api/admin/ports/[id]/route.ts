import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { portFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const port = await prisma.port.findUnique({
      where: { id },
    })

    if (!port) {
      return NextResponse.json(
        { error: "Liman bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: port })
  } catch (error) {
    console.error("Port fetch error:", error)
    return NextResponse.json(
      { error: "Liman getirilirken hata oluştu" },
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
    const validation = portFormSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const existingPort = await prisma.port.findUnique({
      where: { id },
    })

    if (!existingPort) {
      return NextResponse.json(
        { error: "Liman bulunamadı" },
        { status: 404 }
      )
    }

    const updatedPort = await prisma.port.update({
      where: { id },
      data: {
        name: validation.data.name,
        code: validation.data.code,
        city: validation.data.city,
        country: validation.data.country || "TR",
        isActive: validation.data.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPort
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    console.error("Port update error:", error)
    return NextResponse.json(
      { error: "Liman güncellenirken hata oluştu" },
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

    const existingPort = await prisma.port.findUnique({
      where: { id },
    })

    if (!existingPort) {
      return NextResponse.json(
        { error: "Liman bulunamadı" },
        { status: 404 }
      )
    }

    // Soft delete: set isActive to false
    await prisma.port.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: "Liman başarıyla silindi"
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }

    console.error("Port delete error:", error)
    return NextResponse.json(
      { error: "Liman silinirken hata oluştu" },
      { status: 500 }
    )
  }
}
