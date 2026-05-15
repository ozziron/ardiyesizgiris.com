import { NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  containerTrackingRequestSchema,
  fetchContainerTracking,
} from "@/lib/tracking/container-tracking"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = containerTrackingRequestSchema.parse(body)
    const tracking = await fetchContainerTracking(input)

    return NextResponse.json({
      success: true,
      data: tracking,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.errors },
        { status: 400 },
      )
    }

    const message = error instanceof Error ? error.message : "Container tracking sorgusu yapılamadı."
    const isNotConfigured = message.includes("CONTAINER_TRACKING_API_URL")

    return NextResponse.json(
      {
        error: message,
        code: isNotConfigured ? "TRACKING_NOT_CONFIGURED" : "TRACKING_PROVIDER_ERROR",
      },
      { status: isNotConfigured ? 503 : 502 },
    )
  }
}
