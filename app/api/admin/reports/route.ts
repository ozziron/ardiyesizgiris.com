import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

function parseDateParam(value: string | null, endOfDay = false) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  }
  return date
}

export async function GET(request: Request) {
  try {
    await checkAdmin()

    const url = new URL(request.url)
    const from = parseDateParam(url.searchParams.get("from"))
    const to = parseDateParam(url.searchParams.get("to"), true)

    const calculations = await prisma.calculation.findMany({
      where: {
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: {
        port: { select: { name: true, code: true } },
        shippingCompany: { select: { name: true, code: true } },
        exports: { select: { type: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    })

    const rows = calculations.map((calculation) => {
      const pdfExports = calculation.exports.filter((item) => item.type === "PDF")
      const emailExports = calculation.exports.filter((item) => item.type === "EMAIL")

      return {
        id: calculation.id,
        createdAt: calculation.createdAt,
        portName: calculation.port.name,
        portCode: calculation.port.code,
        carrierName: calculation.shippingCompany.name,
        carrierCode: calculation.shippingCompany.code,
        containerType: calculation.containerType,
        containerId: calculation.containerId,
        departureDate: calculation.departureDate,
        gateInDate: calculation.gateInDate,
        freeUntilDate: calculation.freeUntilDate,
        freeDays: calculation.freeDays,
        chargeableDays: calculation.chargeableDays,
        totalCharge: Number(calculation.totalCharge),
        pdfExports: pdfExports.length,
        emailExports: emailExports.length,
        successfulEmailExports: emailExports.filter((item) => item.status === "success" || item.status === "dry_run")
          .length,
      }
    })

    const summary = rows.reduce(
      (acc, row) => {
        acc.totalCharge += row.totalCharge
        acc.chargeableDays += row.chargeableDays
        acc.pdfExports += row.pdfExports
        acc.emailExports += row.emailExports
        return acc
      },
      {
        calculations: rows.length,
        totalCharge: 0,
        chargeableDays: 0,
        pdfExports: 0,
        emailExports: 0,
      }
    )

    return NextResponse.json({
      data: {
        filters: {
          from: from?.toISOString() ?? null,
          to: to?.toISOString() ?? null,
        },
        summary,
        rows,
      },
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 })
    }

    console.error("Reports fetch error:", error)
    return NextResponse.json({ error: "Rapor verileri alinamadi" }, { status: 500 })
  }
}
