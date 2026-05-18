import { prisma } from "@/lib/db/prisma"
import { differenceInCalendarDays } from "date-fns"
import type { CalculationInput, CalculationResult, CarrierSurchargeItem } from "@/types/calculation"

function dayRangeLength(from: number, to: number) {
  return Math.max(0, to - from + 1)
}

// Muafiyet (free time) artık ayrı bir kavram değil; TariffRule Tier 1 ile
// modellenir. tier1PricePerDay === 0 olduğunda tier1DaysFrom..tier1DaysTo
// aralığı muafiyet penceresidir. Tek bir TariffRule sorgusu yeterli.
export async function calculateArdiye(input: CalculationInput): Promise<CalculationResult> {
  const effectiveDate = new Date(input.departureDate)

  // Step 1: Get tariff rule from DB (muafiyet = Tier 1 @ 0)
  const tariff = await prisma.tariffRule.findFirst({
    where: {
      portId: input.portId,
      shippingCompanyId: input.shippingCompanyId,
      containerType: input.containerType,
      imoCargo: input.imoCargo ?? false,
      isActive: true,
      effectiveFrom: { lte: effectiveDate },
      OR: [
        { effectiveUntil: null },
        { effectiveUntil: { gte: effectiveDate } },
      ],
    },
    orderBy: { effectiveFrom: "desc" },
  })

  if (!tariff) {
    const imoLabel = input.imoCargo ? " (IMO)" : ""
    throw new Error(`Bu liman ve hat kombinasyonu için${imoLabel} tarife bulunamadı`)
  }

  // Step 1b: Query applicable carrier surcharges
  const surcharges = await prisma.carrierSurcharge.findMany({
    where: {
      shippingCompanyId: input.shippingCompanyId,
      isActive: true,
    },
  })

  const applicableSurcharges: CarrierSurchargeItem[] = []
  for (const s of surcharges) {
    if (s.containerTypes.length > 0 && !s.containerTypes.includes(input.containerType)) {
      continue
    }
    applicableSurcharges.push({
      name: s.name,
      description: s.description,
      amount: Number(s.amount),
      currency: s.currency,
      apply_type: s.applyType,
    })
  }

  // Build enabled tier list. Tier 1 is always mandatory.
  // The last enabled tier is open-ended (no upper day limit).
  type TierDef = { tier: number; from: number; to: number | null; price: number }
  const enabledTiers: TierDef[] = [
    { tier: 1, from: tariff.tier1DaysFrom, to: tariff.tier1DaysTo, price: Number(tariff.tier1PricePerDay) },
  ]
  if (tariff.tier2Enabled) {
    enabledTiers.push({ tier: 2, from: tariff.tier2DaysFrom, to: tariff.tier2DaysTo, price: Number(tariff.tier2PricePerDay) })
  }
  if (tariff.tier3Enabled) {
    enabledTiers.push({ tier: 3, from: tariff.tier3DaysFrom, to: null, price: Number(tariff.tier3PricePerDay) })
  }

  const tier1Price = enabledTiers[0]!.price
  const tier1Range = tariff.tier1DaysTo - tariff.tier1DaysFrom + 1

  // Free time: Tier 1 ücretsizse muafiyet penceresi Tier 1 aralığının uzunluğudur.
  const free_days = tier1Price === 0 ? tier1Range : 0

  // Step 2: Calculate free until date (departure - free_days + 1)
  const free_until_date = new Date(effectiveDate)
  free_until_date.setDate(free_until_date.getDate() - free_days + 1)

  // Step 3: If no gate-in date, return planning result
  if (!input.gateInDate) {
    return {
      free_days,
      free_until_date,
      total_days_at_port: 0,
      chargeable_days: 0,
      free_period_days: 0,
      total_charge: 0,
      currency: tariff.currency,
      charge_breakdown: [],
      surcharges: applicableSurcharges,
      timeline: {
        departure: input.departureDate,
        free_until: free_until_date,
      },
    }
  }

  const actual_gate_in = new Date(input.gateInDate)

  // Step 4: Check if gate-in > departure
  let warning: string | undefined
  if (actual_gate_in > effectiveDate) {
    warning = "Gate-in tarihi gemi kalkış tarihinden sonra!"
  }

  // Step 5: Total days at port (both dates inclusive)
  const total_days_at_port = differenceInCalendarDays(effectiveDate, actual_gate_in) + 1

  // Step 6: Free vs chargeable (display amounts)
  const free_period_days = Math.min(total_days_at_port, free_days)
  const chargeable_days = Math.max(0, total_days_at_port - free_period_days)

  // Step 7: Tier breakdown across ALL days at port.
  // Iterate enabled tiers; the last enabled tier is open-ended.
  let total_charge = 0
  const charge_breakdown: Array<{
    tier: number
    days: number
    price_per_day: number
    subtotal: number
  }> = []
  let remaining_days = total_days_at_port

  for (let i = 0; i < enabledTiers.length; i++) {
    if (remaining_days <= 0) break
    const td = enabledTiers[i]!
    const isLast = i === enabledTiers.length - 1
    let days: number
    if (isLast) {
      days = remaining_days
    } else {
      const rangeLen = dayRangeLength(td.from, td.to!)
      days = Math.min(remaining_days, rangeLen)
    }
    const subtotal = days * td.price
    total_charge += subtotal
    charge_breakdown.push({ tier: td.tier, days, price_per_day: td.price, subtotal })
    remaining_days -= days
  }

  // NOT: applicableSurcharges total_charge'a EKLENMEZ. Sebep: (1) farkli
  // currency'lerin matematiksel toplanmasi yanlis (TRY tier + USD surcharge),
  // (2) tier breakdown'da satir gozukmedigi icin kullanici "mukerrer" algilar.
  // Surcharges UI/PDF/email'de ayri bolum olarak gosterilir.

  return {
    free_days,
    free_until_date,
    total_days_at_port,
    chargeable_days,
    free_period_days,
    total_charge,
    currency: tariff.currency,
    charge_breakdown,
    surcharges: applicableSurcharges,
    timeline: {
      departure: input.departureDate,
      free_until: free_until_date,
      gate_in: actual_gate_in,
    },
    warning,
  }
}
