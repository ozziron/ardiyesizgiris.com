import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { requireCorporateTeam } from "@/lib/corporate/team"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 })
  }

  try {
    const { id } = await params
    const team = await requireCorporateTeam(session.user.id)

    await prisma.corporateApiKey.updateMany({
      where: {
        id,
        teamId: team.id,
      },
      data: { revokedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "API anahtarı iptal edilemedi." },
      { status: 400 },
    )
  }
}
