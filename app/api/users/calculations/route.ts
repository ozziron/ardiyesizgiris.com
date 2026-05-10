import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  const calculations = await prisma.calculation.findMany({
    where: { userId: user.id },
    include: {
      port: { select: { name: true } },
      shippingCompany: { select: { name: true } },
      // Pull the export history alongside each calculation so the
      // /hesaplamalarim page can render counts + last-export timestamps
      // without a second round-trip per row.
      exports: {
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, recipient: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const data = calculations.map((calc) => {
    const pdfExports = calc.exports.filter((e) => e.type === "PDF")
    const emailExports = calc.exports.filter((e) => e.type === "EMAIL")

    return {
      id: calc.id,
      portName: calc.port.name,
      carrierName: calc.shippingCompany.name,
      departureDate: calc.departureDate,
      gateInDate: calc.gateInDate,
      freeUntilDate: calc.freeUntilDate,
      containerType: calc.containerType,
      totalCharge: calc.totalCharge,
      chargeableDays: calc.chargeableDays,
      createdAt: calc.createdAt,
      exports: {
        pdfCount: pdfExports.length,
        emailCount: emailExports.length,
        // Only successful (sent / dry_run) emails count as "delivered"
        // in the lastEmail timestamp.
        lastPdfAt: pdfExports[0]?.createdAt ?? null,
        lastEmailAt:
          emailExports.find((e) => e.status === "success" || e.status === "dry_run")?.createdAt ??
          null,
        recent: calc.exports.slice(0, 5).map((e) => ({
          id: e.id,
          type: e.type,
          recipient: e.recipient,
          status: e.status,
          createdAt: e.createdAt,
        })),
      },
    }
  })

  return NextResponse.json({ data })
}
