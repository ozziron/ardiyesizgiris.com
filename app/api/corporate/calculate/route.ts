import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { calculateArdiye } from "@/lib/calculations/calculate-tariff"
import { readBearerApiKey, resolveCorporateApiKey } from "@/lib/corporate/api-keys"
import { prisma } from "@/lib/db/prisma"
import { apiCalculationSchema } from "@/lib/validation/schemas"
import { BILLING_ENABLED } from "@/lib/billing/config"

export async function POST(request: Request) {
  if (!BILLING_ENABLED) {
    return NextResponse.json({ error: "Kurumsal API devre dışı." }, { status: 503 })
  }

  const apiKey = readBearerApiKey(request)
  if (!apiKey) {
    return NextResponse.json({ error: "API key gerekli." }, { status: 401 })
  }

  const resolvedKey = await resolveCorporateApiKey(apiKey)
  if (!resolvedKey) {
    return NextResponse.json({ error: "Geçersiz veya pasif API key." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const input = apiCalculationSchema.parse(body)
    const departureDate = new Date(input.departureDate)
    const gateInDate = input.gateInDate ? new Date(input.gateInDate) : undefined

    const result = await calculateArdiye({
      portId: input.portId,
      shippingCompanyId: input.shippingCompanyId,
      containerId: input.containerId,
      containerType: input.containerType,
      departureDate,
      gateInDate,
    })

    const savedCalculation =
      input.containerId && gateInDate
        ? await prisma.calculation
            .create({
              data: {
                portId: input.portId,
                shippingCompanyId: input.shippingCompanyId,
                containerId: input.containerId,
                containerType: input.containerType,
                departureDate,
                gateInDate,
                freeDays: result.free_days,
                freeUntilDate: result.free_until_date,
                chargeableDays: result.chargeable_days,
                totalCharge: result.total_charge,
              },
            })
            .catch(() => null)
        : null

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        calculationId: savedCalculation?.id ?? null,
        teamId: resolvedKey.teamId,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Doğrulama hatası", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kurumsal hesaplama yapılamadı." },
      { status: 400 },
    )
  }
}
