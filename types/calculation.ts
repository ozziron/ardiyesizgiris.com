export interface CalculationInput {
  portId: string
  shippingCompanyId: string
  containerId?: string | null
  containerType: string
  departureDate: Date
  gateInDate?: Date | null
}

export interface ChargeBreakdownItem {
  tier: number
  days: number
  price_per_day: number
  subtotal: number
}

export interface CalculationResult {
  free_days: number
  free_until_date: Date
  total_days_at_port: number
  chargeable_days: number
  free_period_days: number
  total_charge: number
  /** ISO-4217 code (TRY, USD, EUR…) from the matched TariffRule. */
  currency: string
  charge_breakdown: ChargeBreakdownItem[]
  timeline: {
    departure: Date
    free_until: Date
    gate_in?: Date
  }
  warning?: string
}

/**
 * Wire/UI shape of a calculation response: same payload after JSON
 * serialization (Date → string), with optional fields the UI consumes.
 * Use this in client components / hooks; use {@link CalculationResult}
 * in the server-side engine.
 */
export interface CalculationApiResult {
  free_days: number
  free_until_date: string | Date
  total_days_at_port: number
  chargeable_days: number
  total_charge: number
  currency?: string
  charge_breakdown?: ChargeBreakdownItem[]
  warning?: string
  /** Only present for cost-mode runs that get persisted. */
  calculationId?: string | null
}
