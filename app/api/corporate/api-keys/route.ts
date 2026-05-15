import { NextResponse } from "next/server"
import { z, ZodError } from "zod"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createPlainApiKey, getApiKeyPrefix, hashApiKey } from "@/lib/corporate/api-keys"
import { requireCorporateTeam } from "@/lib/corporate/team"

const createKeySchema = z.object({
  name: z.string().trim().min(1, "Anahtar adı girin").max(80, "Anahtar adı çok uzun"),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 })
  }

  try {
    const team = await requireCorporateTeam(session.user.id)
    return NextResponse.json({
      success: true,
      data: team.apiKeys.map(({ keyHash: _keyHash, ...key }) => key),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "API anahtarları alınamadı." },
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
    const input = createKeySchema.parse(body)
    const plainKey = createPlainApiKey()

    const apiKey = await prisma.corporateApiKey.create({
      data: {
        teamId: team.id,
        name: input.name,
        keyPrefix: getApiKeyPrefix(plainKey),
        keyHash: hashApiKey(plainKey),
      },
    })

    const { keyHash: _keyHash, ...safeKey } = apiKey

    return NextResponse.json({
      success: true,
      data: {
        ...safeKey,
        apiKey: plainKey,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Doğrulama hatası", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "API anahtarı oluşturulamadı." },
      { status: 400 },
    )
  }
}
