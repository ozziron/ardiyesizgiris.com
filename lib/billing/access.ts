import type { Prisma, PrismaClient } from "@prisma/client"

const FREE_CALCULATION_LIMIT = 3
const FREE_WINDOW_DAYS = 90

export type CalculationAccess = {
  allowed: boolean
  isPremium: boolean
  remaining: number
  limit: number
  resetAt: Date | null
}

type UsageIdentity = {
  identifier: string
  identifierType: "user" | "ip"
}

export class UpgradeRequiredError extends Error {
  access: CalculationAccess

  constructor(access: CalculationAccess) {
    super("Ücretsiz hesaplama hakkınız doldu. Devam etmek için Premium'a geçin.")
    this.name = "UpgradeRequiredError"
    this.access = access
  }
}

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = request.headers.get("x-real-ip")?.trim()
  return forwardedFor || realIp || "unknown"
}

export const getUsageIdentity = (userId: string | undefined, request: Request): UsageIdentity => {
  if (userId) {
    return { identifier: userId, identifierType: "user" }
  }

  return { identifier: getClientIp(request), identifierType: "ip" }
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const isPremiumUser = (user: {
  membershipType: string
  subscriptionActive: boolean
  subscriptionEndDate: Date | null
}) => {
  if (user.membershipType === "CORPORATE") return true
  if (user.membershipType !== "PREMIUM") return false
  if (!user.subscriptionActive) return false
  return !user.subscriptionEndDate || user.subscriptionEndDate > new Date()
}

type BillingDb = PrismaClient | Prisma.TransactionClient

async function getActiveUsage(
  prisma: BillingDb,
  identity: UsageIdentity,
  now = new Date(),
) {
  const activeUsage = await prisma.freeUsageTracking.findFirst({
    where: {
      identifier: identity.identifier,
      identifierType: identity.identifierType,
      isActive: true,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  })

  if (activeUsage) return activeUsage

  await prisma.freeUsageTracking.updateMany({
    where: {
      identifier: identity.identifier,
      identifierType: identity.identifierType,
      isActive: true,
      expiresAt: { lte: now },
    },
    data: { isActive: false },
  })

  return null
}

export async function getCalculationAccess(
  prisma: BillingDb,
  identity: UsageIdentity,
  userId?: string,
): Promise<CalculationAccess> {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipType: true,
        subscriptionActive: true,
        subscriptionEndDate: true,
      },
    })

    if (user && isPremiumUser(user)) {
      return {
        allowed: true,
        isPremium: true,
        remaining: Number.POSITIVE_INFINITY,
        limit: FREE_CALCULATION_LIMIT,
        resetAt: null,
      }
    }
  }

  const usage = await getActiveUsage(prisma, identity)
  const usageCount = usage?.usageCount ?? 0
  const remaining = Math.max(FREE_CALCULATION_LIMIT - usageCount, 0)

  return {
    allowed: remaining > 0,
    isPremium: false,
    remaining,
    limit: FREE_CALCULATION_LIMIT,
    resetAt: usage?.expiresAt ?? addDays(new Date(), FREE_WINDOW_DAYS),
  }
}

export async function consumeFreeCalculation(
  prisma: PrismaClient,
  identity: UsageIdentity,
  userId?: string,
): Promise<CalculationAccess> {
  return prisma.$transaction(async (tx) => {
    const access = await getCalculationAccess(tx, identity, userId)

    if (access.isPremium) return access
    if (!access.allowed) throw new UpgradeRequiredError(access)

    const now = new Date()
    const usage = await getActiveUsage(tx, identity, now)

    if (!usage) {
      await tx.freeUsageTracking.create({
        data: {
          identifier: identity.identifier,
          identifierType: identity.identifierType,
          usageCount: 1,
          lastUsedAt: now,
          expiresAt: addDays(now, FREE_WINDOW_DAYS),
        },
      })
    } else {
      await tx.freeUsageTracking.update({
        where: { id: usage.id },
        data: {
          usageCount: usage.usageCount + 1,
          lastUsedAt: now,
        },
      })
    }

    if (userId) {
      await tx.user.update({
        where: { id: userId },
        data: {
          calculationsCount: { increment: 1 },
          freeUsageRemaining: Math.max(access.remaining - 1, 0),
        },
      })
    }

    return {
      ...access,
      remaining: Math.max(access.remaining - 1, 0),
    }
  })
}

export { FREE_CALCULATION_LIMIT, FREE_WINDOW_DAYS }
