"use client"
import { useState } from "react"

interface CalculationInput {
  portId: string
  shippingCompanyId: string
  containerType: string
  departureDate: string
  gateInDate?: string
}

export function useCalculation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState(null)

  const calculate = async (input: CalculationInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error("Hesaplama başarısız oldu")
      }

      const data = await response.json()
      setResult(data.data)
      return data.data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { calculate, isLoading, error, result }
}
