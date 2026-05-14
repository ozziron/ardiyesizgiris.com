import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

/**
 * Lightweight read-only endpoint for the live timeline preview on the
 * hesaplama page. Returns the matching FreeTimeRule's freeDays and the
 * computed freeUntilDate as soon as port + carrier + containerType +
 * departureDate are all selected — so the user sees an anticipatory
 * timeline before they hit "Hesapla".
 *
 * Unlike POST /api/calculate this endpoint:
 *   - never persists a Calculation row
 *   - never consumes free-usage tracking (no IP-based quota hit)
 *   - returns 404 (not 400) when no rule exists so the client can
 *     softly hide the preview rather than render an error
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const portId = url.searchParams.get("portId")
  const shippingCompanyId = url.searchParams.get("shippingCompanyId")
  const containerType = url.searchParams.get("containerType")
  const departureDate = url.searchParams.get("departureDate")

  // Be strict: any missing param → 400. The client only calls this once
  // all four fields are filled, so a missing param is a genuine bug.
  if (!portId || !shippingCompanyId || !containerType || !departureDate) {
    return NextResponse.json(
      { error: "portId, shippingCompanyId, containerType ve departureDate gerekli" },
      { status: 400 }
    )
  }

  const effectiveDate = new Date(departureDate)
  if (Number.isNaN(effectiveDate.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 })
  }

  // Same lookup the main calculator does — match on the full hierarchy
  // (carrier > port > containerType) and pick the rule active on the
  // departure date. Most-recent effectiveFrom wins on overlap.
  const rule = await prisma.freeTimeRule.findFirst({
    where: {
      portId,
      shippingCompanyId,
      containerType,
      isActive: true,
      effectiveFrom: { lte: effectiveDate },
      OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: effectiveDate } }],
    },
    orderBy: { effectiveFrom: "desc" },
    select: { freeDays: true },
  })

  if (!rule) {
    return NextResponse.json(
      { error: "Bu liman ve hat kombinasyonu için muafiyet kuralı bulunamadı" },
      { status: 404 }
    )
  }

  // freeUntilDate = departure - freeDays + 1 (same formula as calculator).
  // Serialise to YYYY-MM-DD so the client doesn't have to deal with
  // timezone conversion when feeding it into <CalculationTimeline>.
  const freeUntilDate = new Date(effectiveDate)
  freeUntilDate.setDate(freeUntilDate.getDate() - rule.freeDays + 1)

  return NextResponse.json({
    freeDays: rule.freeDays,
    freeUntilDate: freeUntilDate.toISOString().slice(0, 10),
  })
}
