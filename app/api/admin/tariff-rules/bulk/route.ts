import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

const bulkTariffSchema = z
  .object({
    carrierId: z.string().min(1, "Hat zorunludur"),
    portIds: z.array(z.string().min(1)).min(1, "En az bir liman seçilmelidir"),
    containerTypeCodes: z.array(z.string().min(1)).min(1, "En az bir ekipman tipi seçilmelidir"),
    tier1DaysFrom: z.coerce.number().int().min(1),
    tier1DaysTo: z.coerce.number().int().min(1),
    tier1PricePerDay: z.coerce.number().nonnegative("Fiyat negatif olamaz"),
    tier2DaysFrom: z.coerce.number().int().min(1),
    tier2DaysTo: z.coerce.number().int().min(1),
    tier2PricePerDay: z.coerce.number().positive("Tier 2 ücreti 0'dan büyük olmalıdır"),
    tier3DaysFrom: z.coerce.number().int().min(1),
    tier3PricePerDay: z.coerce.number().positive("Tier 3 ücreti 0'dan büyük olmalıdır"),
    currency: z.string().min(1).default("TRY"),
    effectiveFrom: z.string().min(1, "Başlangıç tarihi zorunludur"),
    effectiveUntil: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    notes: z.string().nullable().optional(),
  })
  .refine((data) => data.tier1DaysTo >= data.tier1DaysFrom, {
    message: "Tier 1 gün aralığı geçersiz",
    path: ["tier1DaysTo"],
  })
  .refine((data) => data.tier2DaysFrom > data.tier1DaysTo, {
    message: "Tier 2, Tier 1 bittikten sonra başlamalı",
    path: ["tier2DaysFrom"],
  })
  .refine((data) => data.tier2DaysTo >= data.tier2DaysFrom, {
    message: "Tier 2 gün aralığı geçersiz",
    path: ["tier2DaysTo"],
  })
  .refine((data) => data.tier3DaysFrom > data.tier2DaysTo, {
    message: "Tier 3, Tier 2 bittikten sonra başlamalı",
    path: ["tier3DaysFrom"],
  })

export async function POST(request: Request) {
  try {
    const session = await checkAdmin()
    const body = await request.json()
    const validation = bulkTariffSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const {
      carrierId,
      portIds,
      containerTypeCodes,
      tier1DaysFrom,
      tier1DaysTo,
      tier1PricePerDay,
      tier2DaysFrom,
      tier2DaysTo,
      tier2PricePerDay,
      tier3DaysFrom,
      tier3PricePerDay,
      currency,
      effectiveFrom,
      effectiveUntil,
      isActive,
      notes,
    } = validation.data

    // Doğrulama: carrier ve portlar mevcut mu?
    const [carrier, ports] = await Promise.all([
      prisma.shippingCompany.findUnique({ where: { id: carrierId } }),
      prisma.port.findMany({ where: { id: { in: portIds } }, select: { id: true, name: true } }),
    ])

    if (!carrier) {
      return NextResponse.json({ error: "Seçilen hat bulunamadı" }, { status: 400 })
    }

    if (ports.length !== portIds.length) {
      return NextResponse.json({ error: "Bir veya daha fazla liman bulunamadı" }, { status: 400 })
    }

    const portMap = new Map(ports.map((p) => [p.id, p.name]))
    const effectiveFromDate = new Date(effectiveFrom)
    const effectiveUntilDate = effectiveUntil ? new Date(effectiveUntil) : null

    // Mevcut çakışan kayıtları bul
    const existingRules = await prisma.tariffRule.findMany({
      where: {
        shippingCompanyId: carrierId,
        portId: { in: portIds },
        containerType: { in: containerTypeCodes },
        effectiveFrom: effectiveFromDate,
      },
      select: { portId: true, containerType: true },
    })

    const existingSet = new Set(
      existingRules.map((r) => `${r.portId}:${r.containerType}`)
    )

    const toCreate: {
      portId: string
      containerType: string
    }[] = []

    const skipped: { port: string; equipment: string; reason: string }[] = []

    for (const portId of portIds) {
      for (const containerTypeCode of containerTypeCodes) {
        const key = `${portId}:${containerTypeCode}`
        if (existingSet.has(key)) {
          skipped.push({
            port: portMap.get(portId) ?? portId,
            equipment: containerTypeCode,
            reason: "Bu kombinasyon için aynı tarihli tarife zaten mevcut",
          })
        } else {
          toCreate.push({ portId, containerType: containerTypeCode })
        }
      }
    }

    let createdCount = 0

    if (toCreate.length > 0) {
      const result = await prisma.$transaction(
        toCreate.map(({ portId, containerType }) =>
          prisma.tariffRule.create({
            data: {
              portId,
              shippingCompanyId: carrierId,
              containerType,
              tier1DaysFrom,
              tier1DaysTo,
              tier1PricePerDay,
              tier2DaysFrom,
              tier2DaysTo,
              tier2PricePerDay,
              tier3DaysFrom,
              tier3PricePerDay,
              currency,
              effectiveFrom: effectiveFromDate,
              effectiveUntil: effectiveUntilDate,
              isActive,
              notes: notes || null,
              createdBy: session.user?.id ?? null,
            },
          })
        )
      )
      createdCount = result.length
    }

    return NextResponse.json(
      {
        success: true,
        created: createdCount,
        skipped,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    console.error("Bulk tariff creation error:", error)
    return NextResponse.json(
      { error: "Toplu tarife oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
