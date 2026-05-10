import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { tariffRuleSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }

  return session
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin()

    const { id } = await params
    const rule = await prisma.tariffRule.findUnique({
      where: { id },
      include: {
        port: true,
        shippingCompany: true,
      },
    })

    if (!rule) {
      return NextResponse.json({ error: "Ucret tarifesi bulunamadi" }, { status: 404 })
    }

    return NextResponse.json({ data: rule })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 })
    }

    console.error("Tariff rule fetch error:", error)
    return NextResponse.json(
      { error: "Ucret tarifesi getirilirken hata olustu" },
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
    const validation = tariffRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Gecersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const [existingRule, port, carrier, duplicateRule] = await Promise.all([
      prisma.tariffRule.findUnique({ where: { id } }),
      prisma.port.findUnique({ where: { id: validation.data.portId } }),
      prisma.shippingCompany.findUnique({
        where: { id: validation.data.shippingCompanyId },
      }),
      prisma.tariffRule.findFirst({
        where: {
          id: { not: id },
          portId: validation.data.portId,
          shippingCompanyId: validation.data.shippingCompanyId,
          containerType: validation.data.containerType,
          effectiveFrom: new Date(validation.data.effectiveFrom),
        },
      }),
    ])

    if (!existingRule) {
      return NextResponse.json({ error: "Ucret tarifesi bulunamadi" }, { status: 404 })
    }

    if (!port || !carrier) {
      return NextResponse.json({ error: "Liman veya hat bulunamadi" }, { status: 400 })
    }

    if (duplicateRule) {
      return NextResponse.json(
        { error: "Bu hat, liman ve ekipman icin ayni baslangic tarihli tarife zaten var" },
        { status: 400 }
      )
    }

    const updatedRule = await prisma.tariffRule.update({
      where: { id },
      data: {
        portId: validation.data.portId,
        shippingCompanyId: validation.data.shippingCompanyId,
        containerType: validation.data.containerType,
        tier1DaysFrom: validation.data.tier1DaysFrom,
        tier1DaysTo: validation.data.tier1DaysTo,
        tier1PricePerDay: validation.data.tier1PricePerDay,
        tier2DaysFrom: validation.data.tier2DaysFrom,
        tier2DaysTo: validation.data.tier2DaysTo,
        tier2PricePerDay: validation.data.tier2PricePerDay,
        tier3DaysFrom: validation.data.tier3DaysFrom,
        tier3PricePerDay: validation.data.tier3PricePerDay,
        currency: validation.data.currency,
        effectiveFrom: new Date(validation.data.effectiveFrom),
        effectiveUntil: validation.data.effectiveUntil
          ? new Date(validation.data.effectiveUntil)
          : null,
        isActive: validation.data.isActive,
        notes: validation.data.notes || null,
      },
      include: {
        port: { select: { id: true, name: true } },
        shippingCompany: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: updatedRule })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 })
    }

    console.error("Tariff rule update error:", error)
    return NextResponse.json(
      { error: "Ucret tarifesi guncellenirken hata olustu" },
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

    const existingRule = await prisma.tariffRule.findUnique({ where: { id } })
    if (!existingRule) {
      return NextResponse.json({ error: "Ucret tarifesi bulunamadi" }, { status: 404 })
    }

    await prisma.tariffRule.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: "Ucret tarifesi silindi" })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 })
    }

    console.error("Tariff rule delete error:", error)
    return NextResponse.json(
      { error: "Ucret tarifesi silinirken hata olustu" },
      { status: 500 }
    )
  }
}
