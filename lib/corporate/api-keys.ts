import crypto from "crypto"
import { prisma } from "@/lib/db/prisma"

const API_KEY_PREFIX = "ag_live"

export function createPlainApiKey() {
  const token = crypto.randomBytes(24).toString("base64url")
  return `${API_KEY_PREFIX}_${token}`
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

export function getApiKeyPrefix(apiKey: string) {
  const parts = apiKey.split("_")
  if (parts.length < 3) return apiKey.slice(0, 10)
  return `${parts[0]}_${parts[1]}_${parts[2].slice(0, 6)}`
}

export async function resolveCorporateApiKey(apiKey: string) {
  const keyHash = hashApiKey(apiKey)

  const key = await prisma.corporateApiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null,
      team: {
        owner: {
          membershipType: "CORPORATE",
        },
      },
    },
    include: {
      team: true,
    },
  })

  if (!key) return null

  await prisma.corporateApiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  })

  return key
}

export function readBearerApiKey(request: Request) {
  const authorization = request.headers.get("authorization")
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim()
  }

  return request.headers.get("x-api-key")?.trim() || ""
}
