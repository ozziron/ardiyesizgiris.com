import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { calculateArdiye } from "@/lib/calculations/calculate-tariff"
import { apiCalculationSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = apiCalculationSchema.parse(body)

    // Parse dates
    const departureDate = new Date(validatedData.departureDate)
    const gateInDate = validatedData.gateInDate ? new Date(validatedData.gateInDate) : undefined

    // Calculate
    const result = await calculateArdiye({
      portId: validatedData.portId,
      shippingCompanyId: validatedData.shippingCompanyId,
      containerId: validatedData.containerId,
      containerType: validatedData.containerType,
      departureDate,
      gateInDate,
    })

    const shouldPersist = Boolean(validatedData.containerId && gateInDate)

    // Save only detailed cost calculations to database
    const savedCalculation = shouldPersist
      ? await prisma?.calculation.create({
          data: {
            portId: validatedData.portId,
            shippingCompanyId: validatedData.shippingCompanyId,
            containerId: validatedData.containerId!,
            containerType: validatedData.containerType,
            departureDate,
            gateInDate,
            freeDays: result.free_days,
            freeUntilDate: result.free_until_date,
            chargeableDays: result.chargeable_days,
            totalCharge: result.total_charge,
          },
        }).catch(() => null)
      : null

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        calculationId: savedCalculation?.id,
      },
    })
  } catch (error) {
    console.error("Calculation error:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Hesaplama yapılamadı" },
      { status: 500 }
    )
  }
}
