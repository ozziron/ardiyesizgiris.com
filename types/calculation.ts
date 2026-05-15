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
