import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

/**
 * Public endpoint — returns the list of currently-active container types
 * for use in the calculation form, free-time rule selects and tariff
 * rule selects. Inactive (soft-deleted) types are filtered out so users
 * don't pick types that are no longer offered.
 */
export async function GET() {
  try {
    const types = await prisma.containerType.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      select: { id: true, code: true, label: true, displayOrder: true },
    })
    return NextResponse.json({ data: types })
  } catch (error) {
    console.error("Container types fetch error:", error)
    return NextResponse.json(
      { error: "Ekipman tipleri alınamadı" },
      { status: 500 }
    )
  }
}
