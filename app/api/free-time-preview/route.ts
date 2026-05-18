import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

/**
 * Lightweight read-only endpoint for the live timeline preview on the
 * hesaplama page. Returns the matching TariffRule's Tier 1 freeDays and the
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

  // Muafiyet artık TariffRule Tier 1 ile modellenir; ayrı bir FreeTimeRule
  // sorgusu yok. Aynı tarife lookup'u (carrier > port > containerType +
  // effective date) ile çalış ve Tier 1 fiyatı 0 ise Tier 1 aralığının
  // uzunluğunu freeDays olarak dön.
  const rule = await prisma.tariffRule.findFirst({
    where: {
      portId,
      shippingCompanyId,
      containerType,
      isActive: true,
      effectiveFrom: { lte: effectiveDate },
      OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: effectiveDate } }],
    },
    orderBy: { effectiveFrom: "desc" },
    select: { tier1DaysFrom: true, tier1DaysTo: true, tier1PricePerDay: true },
  })

  if (!rule) {
    return NextResponse.json(
      { error: "Bu liman ve hat kombinasyonu için tarife bulunamadı" },
      { status: 404 }
    )
  }

  const tier1Days = Math.max(0, rule.tier1DaysTo - rule.tier1DaysFrom + 1)
  const freeDays = Number(rule.tier1PricePerDay) === 0 ? tier1Days : 0
  if (freeDays === 0) {
    return NextResponse.json(
      { error: "Bu kombinasyon için muafiyet penceresi tanımlı değil (Tier 1 ücretli)" },
      { status: 404 }
    )
  }

  // freeUntilDate = departure - freeDays + 1 (same formula as calculator).
  const freeUntilDate = new Date(effectiveDate)
  freeUntilDate.setDate(freeUntilDate.getDate() - freeDays + 1)

  return NextResponse.json({
    freeDays,
    freeUntilDate: freeUntilDate.toISOString().slice(0, 10),
  })
}
