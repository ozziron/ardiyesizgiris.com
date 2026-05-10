import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const carriers = await prisma.shippingCompany.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ data: carriers })
  } catch (error) {
    console.error("Error fetching carriers:", error)
    return NextResponse.json(
      { error: "Hatlar alınamadı" },
      { status: 500 }
    )
  }
}
