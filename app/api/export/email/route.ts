import { NextResponse } from "next/server"
import { sendCalculationEmail } from "@/lib/email/send-calculation-email"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

/**
 * Best-effort export tracker. Records every email attempt (success,
 * dry-run, even not-configured) so the user's history reflects what
 * actually happened. Tracking failures are swallowed so they cannot
 * break the user-facing response.
 */
const trackExport = async (params: {
  calculationId?: string
  userId: string | null
  recipient: string | null
  status: "success" | "dry_run" | "not_configured" | "failed"
}) => {
  if (!params.calculationId) return
  await prisma.calculationExport
    .create({
      data: {
        calculationId: params.calculationId,
        userId: params.userId,
        type: "EMAIL",
        recipient: params.recipient,
        status: params.status,
      },
    })
    .catch((err) => {
      console.warn("Export tracking failed (EMAIL):", err)
    })
}

export async function POST(request: Request) {
  const session = await auth()
  const body = await request.json().catch(() => ({}))
  const recipientEmail = session?.user?.email || body.recipientEmail

  // Resolve user id once — we attach it to whichever tracking path runs.
  const userId = session?.user?.email
    ? (
        await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        })
      )?.id ?? null
    : null

  if (!recipientEmail) {
    return NextResponse.json(
      { error: "Email gondermek icin bir email adresi gerekli." },
      { status: 400 }
    )
  }

  try {
    const result = await sendCalculationEmail({
      ...body,
      recipientEmail,
      recipientName: session?.user?.name || body.recipientName,
    })

    if (result.status === "not_configured") {
      await trackExport({
        calculationId: body?.calculationId,
        userId,
        recipient: recipientEmail,
        status: "not_configured",
      })
      return NextResponse.json(
        {
          error:
            "E-posta gonderim servisi henuz aktif degil. Sonucu PDF olarak indirebilirsiniz; e-posta hizmeti yakinda devreye alinacak.",
          code: "EMAIL_NOT_CONFIGURED",
        },
        { status: 503 }
      )
    }

    if (result.status === "dry_run") {
      await trackExport({
        calculationId: body?.calculationId,
        userId,
        recipient: recipientEmail,
        status: "dry_run",
      })
      return NextResponse.json({
        success: true,
        dryRun: true,
        to: result.to,
        subject: result.subject,
      })
    }

    await trackExport({
      calculationId: body?.calculationId,
      userId,
      recipient: recipientEmail,
      status: "success",
    })
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Email sending error:", error)
    await trackExport({
      calculationId: body?.calculationId,
      userId,
      recipient: recipientEmail,
      status: "failed",
    })
    return NextResponse.json(
      { error: "E-posta gonderilemedi. Lutfen daha sonra tekrar deneyin." },
      { status: 500 }
    )
  }
}
