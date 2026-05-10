import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { freeTimeRuleSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }

  return session
}

export async function GET() {
  try {
    await checkAdmin()

    const rules = await prisma.freeTimeRule.findMany({
      where: { isActive: true },
      include: {
        port: { select: { id: true, name: true, code: true } },
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

    console.error("Free-time rules fetch error:", error)
    return NextResponse.json(
      { error: "Muafiyet kurallari getirilirken hata olustu" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await checkAdmin()
    const body = await request.json()
    const validation = freeTimeRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Gecersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const [port, carrier, existingRule] = await Promise.all([
      prisma.port.findUnique({ where: { id: validation.data.portId } }),
      prisma.shippingCompany.findUnique({
        where: { id: validation.data.shippingCompanyId },
      }),
      prisma.freeTimeRule.findFirst({
        where: {
          portId: validation.data.portId,
          shippingCompanyId: validation.data.shippingCompanyId,
          containerType: validation.data.containerType,
          effectiveFrom: new Date(validation.data.effectiveFrom),
        } as any,
      }),
    ])

    if (!port || !carrier) {
      return NextResponse.json(
        { error: "Liman veya hat bulunamadi" },
        { status: 400 }
      )
    }

    if (existingRule) {
      return NextResponse.json(
        { error: "Bu hat, liman ve ekipman icin ayni baslangic tarihli kayit zaten var" },
        { status: 400 }
      )
    }

    const rule = await prisma.freeTimeRule.create({
      data: {
        portId: validation.data.portId,
        shippingCompanyId: validation.data.shippingCompanyId,
        containerType: validation.data.containerType,
        freeDays: validation.data.freeDays,
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

    console.error("Free-time rule creation error:", error)
    return NextResponse.json(
      { error: "Muafiyet kurali olusturulurken hata olustu" },
      { status: 500 }
    )
  }
}
