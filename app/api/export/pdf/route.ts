import { NextResponse } from "next/server"
import { generateCalculationPDF } from "@/lib/pdf/export-pdf"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pdfDataUri = generateCalculationPDF(body)

    // Record export history when both:
    //   1. The user is logged in (we know who exported)
    //   2. The payload references a saved calculation (planning mode is
    //      ephemeral and has no calculation row to attach an export to)
    // We do this best-effort — a tracking failure must never block the
    // PDF response, hence the .catch(() => null).
    if (body?.calculationId) {
      const session = await auth()
      const userId = session?.user?.email
        ? (
            await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true },
            })
          )?.id ?? null
        : null

      await prisma.calculationExport
        .create({
          data: {
            calculationId: body.calculationId,
            userId,
            type: "PDF",
            status: "success",
          },
        })
        .catch((err) => {
          console.warn("Export tracking failed (PDF):", err)
        })
    }

    return NextResponse.json({
      success: true,
      pdfDataUri,
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "PDF oluşturulamadı" },
      { status: 500 }
    )
  }
}
