import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
  }

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  const calculation = await prisma.calculation.findFirst({
    where: { id, userId: user.id },
    include: {
      port: { select: { name: true, code: true } },
      shippingCompany: { select: { name: true, code: true } },
      exports: {
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, recipient: true, status: true, createdAt: true },
      },
    },
  })

  if (!calculation) {
    return NextResponse.json({ error: "Hesaplama bulunamadı" }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      id: calculation.id,
      portName: calculation.port.name,
      portCode: calculation.port.code,
      carrierName: calculation.shippingCompany.name,
      carrierCode: calculation.shippingCompany.code,
      containerId: calculation.containerId,
      containerType: calculation.containerType,
      departureDate: calculation.departureDate,
      gateInDate: calculation.gateInDate,
      freeDays: calculation.freeDays,
      freeUntilDate: calculation.freeUntilDate,
      chargeableDays: calculation.chargeableDays,
      totalCharge: calculation.totalCharge,
      createdAt: calculation.createdAt,
      exports: calculation.exports.map((e) => ({
        id: e.id,
        type: e.type,
        recipient: e.recipient,
        status: e.status,
        createdAt: e.createdAt,
      })),
    },
  })
}
