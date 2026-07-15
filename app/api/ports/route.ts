import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shippingCompanyId = searchParams.get("shippingCompanyId")

    // Hat seçiliyse yalnızca o hat için geçerli (aktif ve süresi dolmamış)
    // tarife kuralı olan limanlar döner — hat, limana hizmet vermiyorsa
    // liman dropdown'da görünmez. Parametresiz çağrı eski davranıştır.
    const ports = await prisma.port.findMany({
      where: {
        isActive: true,
        ...(shippingCompanyId
          ? {
              tariffRules: {
                some: {
                  shippingCompanyId,
                  isActive: true,
                  OR: [
                    { effectiveUntil: null },
                    { effectiveUntil: { gte: new Date() } },
                  ],
                },
              },
            }
          : {}),
      },
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
