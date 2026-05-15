import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [ports, carriers, tariffRules, calculations] = await Promise.all([
      prisma.port.count(),
      prisma.shippingCompany.count(),
      prisma.tariffRule.count(),
      prisma.calculation.count(),
    ])

    return NextResponse.json({
      data: {
        ports,
        carriers,
        tariffRules,
        calculations,
      },
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "İstatistikler alınamadı" }, { status: 500 })
  }
}
