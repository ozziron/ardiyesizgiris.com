import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { tariffRuleSchema } from "@/lib/validation/schemas"
import type { Prisma } from "@prisma/client"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }

  return session
}

export async function GET(request: Request) {
  try {
    await checkAdmin()
    const { searchParams } = new URL(request.url)
    const shippingCompanyId = searchParams.get("shippingCompanyId")
    const city = searchParams.get("city")
    const portId = searchParams.get("portId")
    const where: Prisma.TariffRuleWhereInput = { isActive: true }

    if (shippingCompanyId) {
      where.shippingCompanyId = shippingCompanyId
    }

    if (portId) {
      where.portId = portId
    } else if (city) {
      where.port = { city }
    }

    const rules = await prisma.tariffRule.findMany({
      where,
      include: {
        port: { select: { id: true, name: true, code: true, city: true } },
        shippingCompany: { select: { id: true, name: true, code: true } },
      },
      orderBy: [
        { shippingCompany: { name: "asc" } },
        { port: { name: "asc" } },
        { containerType: "asc" },
        { effectiveFrom: "desc" },
      ],
    })

    return NextResponse.json({ data: rules })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 })
    }

    console.error("Tariff rules fetch error:", error)
    return NextResponse.json(
      { error: "Ücret tarifeleri getirilirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await checkAdmin()
    const body = await request.json()
    const validation = tariffRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Gecersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const [port, carrier, duplicateRule] = await Promise.all([
      prisma.port.findUnique({ where: { id: validation.data.portId } }),
      prisma.shippingCompany.findUnique({
        where: { id: validation.data.shippingCompanyId },
      }),
      prisma.tariffRule.findFirst({
        where: {
          portId: validation.data.portId,
          shippingCompanyId: validation.data.shippingCompanyId,
          containerType: validation.data.containerType,
          imoCargo: validation.data.imoCargo ?? false,
          effectiveFrom: new Date(validation.data.effectiveFrom),
        },
      }),
    ])

    if (!port || !carrier) {
      return NextResponse.json({ error: "Liman veya hat bulunamadi" }, { status: 400 })
    }

    if (duplicateRule) {
      return NextResponse.json(
        { error: "Bu hat, liman ve ekipman için aynı başlangıç tarihli tarife zaten var" },
        { status: 400 }
      )
    }

    const rule = await prisma.tariffRule.create({
      data: {
        portId: validation.data.portId,
        shippingCompanyId: validation.data.shippingCompanyId,
        containerType: validation.data.containerType,
        imoCargo: validation.data.imoCargo ?? false,
        tier1DaysFrom: validation.data.tier1DaysFrom,
        tier1DaysTo: validation.data.tier1DaysTo,
        tier1PricePerDay: validation.data.tier1PricePerDay,
        tier2DaysFrom: validation.data.tier2DaysFrom,
        tier2DaysTo: validation.data.tier2DaysTo,
        tier2PricePerDay: validation.data.tier2PricePerDay,
        tier2Enabled: validation.data.tier2Enabled ?? true,
        tier3DaysFrom: validation.data.tier3DaysFrom,
        tier3PricePerDay: validation.data.tier3PricePerDay,
        tier3Enabled: validation.data.tier3Enabled ?? true,
        currency: validation.data.currency,
        effectiveFrom: new Date(validation.data.effectiveFrom),
        effectiveUntil: validation.data.effectiveUntil
          ? new Date(validation.data.effectiveUntil)
          : null,
        isActive: validation.data.isActive ?? true,
        notes: validation.data.notes || null,
        createdBy: session.user?.id ?? null,
      },
      include: {
        port: { select: { id: true, name: true } },
        shippingCompany: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: rule }, { status: 201 })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 })
    }

    console.error("Tariff rule creation error:", error)
    return NextResponse.json(
      { error: "Ücret tarifesi oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
