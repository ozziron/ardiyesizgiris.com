import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import {
  UpgradeRequiredError,
  consumeFreeCalculation,
  getCalculationAccess,
  getClientIp,
  getUsageIdentity,
} from "@/lib/billing/access"
import { prisma } from "@/lib/db/prisma"
import { calculateArdiye } from "@/lib/calculations/calculate-tariff"
import { apiCalculationSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const identity = getUsageIdentity(userId, request)
    const access = await getCalculationAccess(prisma, identity, userId)

    if (!access.allowed) {
      throw new UpgradeRequiredError(access)
    }

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
    const updatedAccess = await consumeFreeCalculation(prisma, identity, userId)

    // Save only detailed cost calculations to database
    const savedCalculation = shouldPersist
      ? await prisma?.calculation.create({
          data: {
            userId,
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
            ipAddress: getClientIp(request),
          },
        }).catch(() => null)
      : null

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        calculationId: savedCalculation?.id,
        usage: {
          isPremium: updatedAccess.isPremium,
          remaining: Number.isFinite(updatedAccess.remaining) ? updatedAccess.remaining : null,
          limit: updatedAccess.limit,
          resetAt: updatedAccess.resetAt,
        },
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

    if (error instanceof UpgradeRequiredError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "UPGRADE_REQUIRED",
          usage: {
            isPremium: error.access.isPremium,
            remaining: error.access.remaining,
            limit: error.access.limit,
            resetAt: error.access.resetAt,
          },
        },
        { status: 402 },
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
