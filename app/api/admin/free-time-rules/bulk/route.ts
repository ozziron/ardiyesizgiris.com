import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

/**
 * Bulk-create free-time rules for the cartesian product
 *   portIds × containerTypes (carrier, days, dates fixed).
 *
 * Removes the tedium of entering 9+ near-identical rows when admins
 * want to seed coverage for a city's ports across all standard
 * container types.
 *
 * Per-combination outcomes are reported separately so the UI can show
 * "X yeni kural eklendi, Y tanesi zaten mevcuttu, Z hata" rather than
 * failing the whole batch on a single duplicate.
 */
const bulkSchema = z.object({
  portIds: z.array(z.string().min(1)).min(1, "En az 1 liman seçilmeli"),
  shippingCompanyId: z.string().min(1, "Hat seçilmeli"),
  containerTypes: z.array(z.string().min(1)).min(1, "En az 1 ekipman tipi seçilmeli"),
  freeDays: z.number().int().min(1, "Muafiyet günü en az 1 olmalı"),
  effectiveFrom: z.string().min(1, "Başlangıç tarihi gerekli"),
  effectiveUntil: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  notes: z.string().optional().nullable(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    const validation = bulkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.errors },
        { status: 400 }
      )
    }

    const {
      portIds,
      shippingCompanyId,
      containerTypes,
      freeDays,
      effectiveFrom,
      effectiveUntil,
      isActive,
      notes,
    } = validation.data

    const effectiveFromDate = new Date(effectiveFrom)
    const effectiveUntilDate = effectiveUntil ? new Date(effectiveUntil) : null
    if (Number.isNaN(effectiveFromDate.getTime())) {
      return NextResponse.json({ error: "Geçersiz başlangıç tarihi" }, { status: 400 })
    }

    // Verify referenced records exist BEFORE attempting inserts — gives a
    // clearer 400 than an FK violation halfway through.
    const [carrier, ports] = await Promise.all([
      prisma.shippingCompany.findUnique({ where: { id: shippingCompanyId } }),
      prisma.port.findMany({ where: { id: { in: portIds } }, select: { id: true, name: true } }),
    ])

    if (!carrier) {
      return NextResponse.json({ error: "Hat bulunamadı" }, { status: 400 })
    }
    if (ports.length !== portIds.length) {
      return NextResponse.json(
        { error: "Seçilen limanlardan biri veya birkaçı bulunamadı" },
        { status: 400 }
      )
    }

    const portNameById = new Map(ports.map((p) => [p.id, p.name]))

    type Outcome = {
      portId: string
      portName: string
      containerType: string
      status: "created" | "skipped" | "failed"
      reason?: string
    }
    const outcomes: Outcome[] = []

    // Process each combination independently. A per-cell failure (e.g.
    // unique-constraint violation when the rule already exists) does NOT
    // abort the rest of the batch.
    for (const portId of portIds) {
      for (const containerType of containerTypes) {
        try {
          const existing = await prisma.freeTimeRule.findFirst({
            where: {
              portId,
              shippingCompanyId,
              containerType,
              effectiveFrom: effectiveFromDate,
            },
            select: { id: true },
          })

          if (existing) {
            outcomes.push({
              portId,
              portName: portNameById.get(portId) ?? portId,
              containerType,
              status: "skipped",
              reason: "Aynı başlangıç tarihli kayıt zaten var",
            })
            continue
          }

          await prisma.freeTimeRule.create({
            data: {
              portId,
              shippingCompanyId,
              containerType,
              freeDays,
              effectiveFrom: effectiveFromDate,
              effectiveUntil: effectiveUntilDate,
              isActive,
              notes: notes || null,
              createdBy: session.user?.id ?? null,
            },
          })

          outcomes.push({
            portId,
            portName: portNameById.get(portId) ?? portId,
            containerType,
            status: "created",
          })
        } catch (err) {
          outcomes.push({
            portId,
            portName: portNameById.get(portId) ?? portId,
            containerType,
            status: "failed",
            reason: err instanceof Error ? err.message : "Bilinmeyen hata",
          })
        }
      }
    }

    const created = outcomes.filter((o) => o.status === "created").length
    const skipped = outcomes.filter((o) => o.status === "skipped").length
    const failed = outcomes.filter((o) => o.status === "failed").length

    return NextResponse.json(
      {
        success: true,
        summary: { created, skipped, failed, total: outcomes.length },
        outcomes,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }
    console.error("Bulk free-time creation error:", error)
    return NextResponse.json(
      { error: "Toplu muafiyet oluşturulurken hata oluştu" },
      { status: 500 }
    )
  }
}
