import { prisma } from "@/lib/db/prisma"

export async function requireCorporateTeam(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      membershipType: true,
    },
  })

  if (!user || user.membershipType !== "CORPORATE") {
    throw new Error("Bu alan yalnızca Corporate üyeler için kullanılabilir.")
  }

  const existingMembership = await prisma.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          apiKeys: {
            where: { revokedAt: null },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (existingMembership) return existingMembership.team

  const teamName = user.companyName || user.name || user.email || "Corporate Team"

  return prisma.team.create({
    data: {
      name: teamName,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      apiKeys: {
        where: { revokedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
