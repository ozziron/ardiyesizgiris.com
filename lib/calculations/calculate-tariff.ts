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
    throw new Error("Bu liman ve hat kombinasyonu için tarife bulunamadı")
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
      amount: Number(s.amount),
      currency: s.currency,
      apply_type: s.applyType,
    })
  }

  const tier1Price = Number(tariff.tier1PricePerDay)
  const tier2Price = Number(tariff.tier2PricePerDay)
  const tier3Price = Number(tariff.tier3PricePerDay)

  const tier1Days = dayRangeLength(tariff.tier1DaysFrom, tariff.tier1DaysTo)
  const tier2Days = dayRangeLength(tariff.tier2DaysFrom, tariff.tier2DaysTo)

  // Free time: Tier 1 ücretsizse muafiyet penceresi Tier 1 aralığının uzunluğudur.
  const free_days = tier1Price === 0 ? tier1Days : 0

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

  // Step 7: Tier breakdown across ALL days at port. Tier 1 subtotal is 0
  // when it represents muafiyet, but we still surface the row so consumers
  // (result-card, PDF, email) can display "Muafiyet Dönemi: N gün".
  let total_charge = 0
  const charge_breakdown: Array<{
    tier: number
    days: number
    price_per_day: number
    subtotal: number
  }> = []
  let remaining_days = total_days_at_port

  // Tier 1 (may be muafiyet)
  if (remaining_days > 0) {
    const days = Math.min(remaining_days, tier1Days)
    const subtotal = days * tier1Price
    total_charge += subtotal
    charge_breakdown.push({ tier: 1, days, price_per_day: tier1Price, subtotal })
    remaining_days -= days
  }

  // Tier 2
  if (remaining_days > 0) {
    const days = Math.min(remaining_days, tier2Days)
    const subtotal = days * tier2Price
    total_charge += subtotal
    charge_breakdown.push({ tier: 2, days, price_per_day: tier2Price, subtotal })
    remaining_days -= days
  }

  // Tier 3
  if (remaining_days > 0) {
    const days = remaining_days
    const subtotal = days * tier3Price
    total_charge += subtotal
    charge_breakdown.push({ tier: 3, days, price_per_day: tier3Price, subtotal })
  }

  total_charge += applicableSurcharges.reduce((sum, s) => sum + s.amount, 0)

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
