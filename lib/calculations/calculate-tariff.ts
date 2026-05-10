import { prisma } from "@/lib/db/prisma"
import { differenceInCalendarDays } from "date-fns"
import type { CalculationInput, CalculationResult } from "@/types/calculation"

export async function calculateArdiye(input: CalculationInput): Promise<CalculationResult> {
  const effectiveDate = new Date(input.departureDate)

  // Step 1: Get free time rule from DB
  const freeTimeRule = await prisma.freeTimeRule.findFirst({
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
    } as any,
    orderBy: { effectiveFrom: "desc" },
  })

  if (!freeTimeRule) {
    throw new Error("Bu liman ve hat kombinasyonu için muafiyet kuralı bulunamadı")
  }

  const free_days = freeTimeRule.freeDays

  // Step 2: Calculate free until date (departure - free_days + 1)
  const free_until_date = new Date(input.departureDate)
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
      charge_breakdown: [],
      timeline: {
        departure: input.departureDate,
        free_until: free_until_date,
      },
    }
  }

  const actual_gate_in = new Date(input.gateInDate)

  // Step 4: Check if gate-in > departure
  let warning: string | undefined
  if (actual_gate_in > input.departureDate) {
    warning = "Gate-in tarihi gemi kalkış tarihinden sonra!"
  }

  // Step 5: Total days at port (both dates inclusive)
  const total_days_at_port = differenceInCalendarDays(input.departureDate, actual_gate_in) + 1

  // Step 6: Calculate chargeable days
  let chargeable_days = 0
  if (actual_gate_in >= free_until_date) {
    chargeable_days = 0
  } else {
    chargeable_days = Math.max(total_days_at_port - free_days, 0)
  }

  const free_period_days = total_days_at_port - chargeable_days

  // If no chargeable days, return early
  if (chargeable_days === 0) {
    return {
      free_days,
      free_until_date,
      total_days_at_port,
      chargeable_days: 0,
      free_period_days,
      total_charge: 0,
      charge_breakdown: [],
      timeline: {
        departure: input.departureDate,
        free_until: free_until_date,
        gate_in: actual_gate_in,
      },
      warning,
    }
  }

  // Step 7: Get tariff rule from DB
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
    throw new Error("Bu kombinasyon için ücret tarifesi bulunamadı")
  }

  // Step 8: Apply tiered pricing (Tier 1 → 2 → 3)
  let total_charge = 0
  const charge_breakdown: any[] = []
  let remaining_days = chargeable_days

  // Tier 1
  if (remaining_days > 0) {
    const days = Math.min(remaining_days, tariff.tier1DaysTo)
    const subtotal = days * Number(tariff.tier1PricePerDay)
    total_charge += subtotal
    charge_breakdown.push({
      tier: 1,
      days,
      price_per_day: Number(tariff.tier1PricePerDay),
      subtotal,
    })
    remaining_days -= days
  }

  // Tier 2
  if (remaining_days > 0) {
    const capacity = tariff.tier2DaysTo - tariff.tier1DaysTo
    const days = Math.min(remaining_days, capacity)
    const subtotal = days * Number(tariff.tier2PricePerDay)
    total_charge += subtotal
    charge_breakdown.push({
      tier: 2,
      days,
      price_per_day: Number(tariff.tier2PricePerDay),
      subtotal,
    })
    remaining_days -= days
  }

  // Tier 3
  if (remaining_days > 0) {
    const days = remaining_days
    const subtotal = days * Number(tariff.tier3PricePerDay)
    total_charge += subtotal
    charge_breakdown.push({
      tier: 3,
      days,
      price_per_day: Number(tariff.tier3PricePerDay),
      subtotal,
    })
  }

  return {
    free_days,
    free_until_date,
    total_days_at_port,
    chargeable_days,
    free_period_days,
    total_charge,
    charge_breakdown,
    timeline: {
      departure: input.departureDate,
      free_until: free_until_date,
      gate_in: actual_gate_in,
    },
    warning,
  }
}
