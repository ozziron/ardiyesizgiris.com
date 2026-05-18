import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Maersk kodunu ShippingCompany tablosundan bul
  const maerskCodes = ["MAEU", "MAERSK", "MSK"]
  let maersk = null

  for (const code of maerskCodes) {
    maersk = await prisma.shippingCompany.findUnique({ where: { code } })
    if (maersk) break
  }

  if (!maersk) {
    console.log("Maersk hattı bulunamadı. Önce admin panelden Maersk/MAEU ekleyin.")
    console.log("Seed atlandı.")
    await prisma.$disconnect()
    process.exit(0)
  }

  const args = {
    shippingCompanyId: maersk.id,
    name: "DTE-Freetime Extension Surcharge",
    description:
      "Days 0-5 will be included in DTE-Freetime Extension Surcharge of USD 160 per reefer container",
    amount: 160,
    currency: "USD",
    applyType: "PER_CONTAINER",
    containerTypes: ["20RF", "40RF"],
    isActive: true,
  }

  const existing = await prisma.carrierSurcharge.findFirst({
    where: {
      shippingCompanyId: maersk.id,
      name: args.name,
    },
  })

  if (existing) {
    const updated = await prisma.carrierSurcharge.update({
      where: { id: existing.id },
      data: args,
    })
    console.log(
      `Güncellendi: ${updated.name} (${updated.containerTypes.join(", ")}) — ${updated.amount} ${updated.currency}`
    )
  } else {
    const created = await prisma.carrierSurcharge.create({ data: args })
    console.log(
      `Oluşturuldu: ${created.name} (${created.containerTypes.join(", ")}) — ${created.amount} ${created.currency}`
    )
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
