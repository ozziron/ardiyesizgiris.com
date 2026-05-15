import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { requireCorporateTeam } from "@/lib/corporate/team"

const inviteSchema = z.object({
  email: z.string().email("Geçerli email girin"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 })
  }

  try {
    const team = await requireCorporateTeam(session.user.id)
    return NextResponse.json({ success: true, data: team })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takım bilgisi alınamadı." },
      { status: 403 },
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 })
  }

  try {
    const team = await requireCorporateTeam(session.user.id)
    const body = await request.json()
    const input = inviteSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Bu email ile kayıtlı kullanıcı bulunamadı." },
        { status: 404 },
      )
    }

    const member = await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: user.id,
        },
      },
      update: { role: input.role },
      create: {
        teamId: team.id,
        userId: user.id,
        role: input.role,
      },
    })

    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Doğrulama hatası", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takım üyesi eklenemedi." },
      { status: 400 },
    )
  }
}
