import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const ports = await prisma.port.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, city: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ data: ports })
  } catch (error) {
    console.error("Error fetching ports:", error)
    return NextResponse.json(
      { error: "Limanlar alınamadı" },
      { status: 500 }
    )
  }
}
