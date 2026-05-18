import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Port definitions (Ambarlı, Gemlik, Gebze, İskenderun, İzmir, İzmit Körfezi, Mersin)
// ---------------------------------------------------------------------------
const PORTS = [
  { name: "Ambarlı", code: "TRAMB", city: "İstanbul" },
  { name: "Gemlik", code: "TRGEM", city: "Bursa" },
  { name: "Gebze", code: "TRGEB", city: "Kocaeli" },
  { name: "İskenderun", code: "TRISK", city: "Hatay" },
  { name: "İzmir", code: "TRIZM", city: "İzmir" },
  { name: "İzmit Körfezi", code: "TRIZT", city: "Kocaeli" },
  { name: "Mersin", code: "TRMER", city: "Mersin" },
] as const

// ---------------------------------------------------------------------------
// Container types needed beyond what already exists (20DC, 40DC, 40HC)
// ---------------------------------------------------------------------------
const CONTAINER_TYPES = [
  { code: "20OT", label: "20' Açık Üst (OT)" },
  { code: "40OT", label: "40' Açık Üst (OT)" },
  { code: "20FR", label: "20' Flat Rack (FR)" },
  { code: "40FR", label: "40' Flat Rack (FR)" },
  { code: "20RF", label: "20' Buzdolabı (RF)" },
  { code: "40RF", label: "40' Buzdolabı (RF)" },
  { code: "20OG", label: "20' Out-of-Gauge (OG)" },
  { code: "40OG", label: "40' Out-of-Gauge (OG)" },
  { code: "20IM", label: "20' IMO Cargo (IM)" },
  { code: "40IM", label: "40' IMO Cargo (IM)" },
] as const

// ---------------------------------------------------------------------------
// Tariff tier helpers
// ---------------------------------------------------------------------------
type Tier = {
  from: number
  to: number // 999 = "infinite" sentinel, mapped to 365 below
  price20: number
  price40: number
}

/** "1+" style flat rate — freeDays=0, all days at same price. */
function flat(price20: number, price40: number): Tier[] {
  return [{ from: 1, to: 999, price20, price40 }]
}

/** "1-N Free, N+1-M, M+1+" style 3-tier with free period. */
function withFree(
  freeTo: number,
  t2To: number,
  t2p20: number, t2p40: number,
  t3p20: number, t3p40: number,
): Tier[] {
  return [
    { from: 1, to: freeTo, price20: 0, price40: 0 },
    { from: freeTo + 1, to: t2To, price20: t2p20, price40: t2p40 },
    { from: t2To + 1, to: 999, price20: t3p20, price40: t3p40 },
  ]
}

/** "1-N paid, N+1-M, M+1+" style 3-tier with NO free period. */
function noFree(
  t1To: number, t1p20: number, t1p40: number,
  t2To: number, t2p20: number, t2p40: number,
  t3p20: number, t3p40: number,
): Tier[] {
  return [
    { from: 1, to: t1To, price20: t1p20, price40: t1p40 },
    { from: t1To + 1, to: t2To, price20: t2p20, price40: t2p40 },
    { from: t2To + 1, to: 999, price20: t3p20, price40: t3p40 },
  ]
}

// Sentinel: tier 3 "to infinity" is stored as tier3DaysFrom only (no To).
// The seed writes tier3DaysFrom = last tier.from; no tier3DaysTo in schema.
const INF = 999

// ---------------------------------------------------------------------------
// Category 1: Dry and In-Gauge Special Containers
// Applies to: 20DC, 40DC, 20OT, 40OT, 20FR, 40FR
// ---------------------------------------------------------------------------
const DRY_TYPES = ["20DC", "40DC", "20OT", "40OT", "20FR", "40FR"] as const

type DryPortKey = "Ambarlı" | "Gemlik" | "Gebze" | "İskenderun" | "İzmir" | "İzmit Körfezi" | "Mersin"

const DRY_TIERS: Record<DryPortKey, Tier[]> = {
  Ambarlı:       withFree(8, 14, 15, 30, 30, 60),
  Gemlik:        withFree(7, 14, 15, 30, 30, 60),
  Gebze:         withFree(10, 14, 15, 30, 30, 60),
  İskenderun:    withFree(7, 14, 15, 30, 30, 60),
  İzmir:         withFree(10, 14, 15, 30, 30, 60),
  "İzmit Körfezi": withFree(10, 14, 15, 30, 30, 60),
  Mersin:        withFree(6, 14, 15, 30, 30, 60),
}

// ---------------------------------------------------------------------------
// Category 2: Reefer Containers (20RF, 40RF)
// Days 0-5 = DTE surcharge (separate CarrierSurcharge). Tariff starts day 6.
// ---------------------------------------------------------------------------
const REEFER_TYPES = ["20RF", "40RF"] as const

type ReeferPortKey = DryPortKey

// Days 1-5 = free (covered by DTE surcharge), 6-10 = port rate, 11+ = higher rate
const REEFER_TIERS: Record<ReeferPortKey, Tier[]> = {
  Ambarlı:          withFree(5, 10, 85, 85, 100, 100),
  Gemlik:           withFree(5, 10, 70, 70, 90, 90),
  Gebze:            withFree(5, 10, 80, 80, 100, 100),
  İskenderun:       withFree(5, 10, 90, 90, 100, 100),
  İzmir:            withFree(5, 10, 80, 80, 100, 100),
  "İzmit Körfezi":  withFree(5, 10, 70, 70, 90, 90),
  Mersin:           withFree(5, 10, 95, 95, 110, 110),
}

// ---------------------------------------------------------------------------
// Category 3: Out-of-Gauge Special Containers (20OG, 40OG)
// ---------------------------------------------------------------------------
const OOG_TYPES = ["20OG", "40OG"] as const

type OogPortKey = DryPortKey

const OOG_TIERS: Record<OogPortKey, Tier[]> = {
  Ambarlı:       flat(75, 100),
  Gemlik:        flat(50, 60),
  Gebze:         flat(40, 50),
  İskenderun:    flat(40, 50),
  İzmir:         withFree(5, 999, 40, 50, 40, 50),
  "İzmit Körfezi": withFree(10, 999, 75, 90, 75, 90),
  Mersin:        withFree(5, 999, 75, 90, 75, 90),
}

// ---------------------------------------------------------------------------
// Category 4: IMO Cargo (20IM, 40IM)
// ---------------------------------------------------------------------------
const IMO_TYPES = ["20IM", "40IM"] as const

type ImoPortKey = DryPortKey

const IMO_TIERS: Record<ImoPortKey, Tier[]> = {
  Ambarlı:       withFree(7, 14, 20, 40, 40, 80),
  Gemlik:        withFree(7, 14, 20, 40, 40, 80),
  Gebze:         noFree(7, 10, 20, 14, 20, 40, 40, 80),
  İskenderun:    noFree(7, 10, 20, 14, 20, 40, 40, 80),
  İzmir:         withFree(7, 14, 20, 40, 40, 80),
  "İzmit Körfezi": withFree(7, 14, 20, 40, 40, 80),
  Mersin:        withFree(6, 14, 20, 40, 40, 80),
}

// ---------------------------------------------------------------------------
// Flatten helpers
// ---------------------------------------------------------------------------
interface FlatRule {
  portName: string
  containerType: string
  tiers: Tier[]
  category: string
}

function flatten(): FlatRule[] {
  const rules: FlatRule[] = []

  for (const [portName, tiers] of Object.entries(DRY_TIERS)) {
    for (const ct of DRY_TYPES) {
      rules.push({ portName, containerType: ct, tiers, category: "Dry/In-Gauge" })
    }
  }

  for (const [portName, tiers] of Object.entries(REEFER_TIERS)) {
    for (const ct of REEFER_TYPES) {
      rules.push({ portName, containerType: ct, tiers, category: "Reefer" })
    }
  }

  for (const [portName, tiers] of Object.entries(OOG_TIERS)) {
    for (const ct of OOG_TYPES) {
      rules.push({ portName, containerType: ct, tiers, category: "OOG" })
    }
  }

  for (const [portName, tiers] of Object.entries(IMO_TIERS)) {
    for (const ct of IMO_TYPES) {
      rules.push({ portName, containerType: ct, tiers, category: "IMO" })
    }
  }

  return rules
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // 1. Find Maersk
  const carrier = await prisma.shippingCompany.findFirst({
    where: { code: { in: ["MAEU", "MAERSK", "MSK"] }, isActive: true },
  })
  if (!carrier) {
    console.log("Maersk hattı bulunamadı. Önce admin panelden Maersk/MAEU ekleyin.")
    process.exit(0)
  }
  console.log(`Hat: ${carrier.name} (${carrier.code})`)

  // 2. Upsert ports
  const portMap = new Map<string, string>()
  for (const p of PORTS) {
    const port = await prisma.port.upsert({
      where: { code: p.code },
      update: { name: p.name, city: p.city, isActive: true },
      create: { name: p.name, code: p.code, city: p.city },
    })
    portMap.set(p.name, port.id)
    console.log(`Liman: ${port.name} (${port.code})`)
  }

  // 3. Upsert container types
  for (const ct of CONTAINER_TYPES) {
    await prisma.containerType.upsert({
      where: { code: ct.code },
      update: { label: ct.label, isActive: true },
      create: { code: ct.code, label: ct.label },
    })
  }
  console.log(`Konteyner tipleri: ${CONTAINER_TYPES.map(c => c.code).join(", ")}`)

  // 4. Upsert tariff rules
  const allRules = flatten()
  const effectiveFrom = new Date("2026-01-01")
  let created = 0
  let skipped = 0

  for (const rule of allRules) {
    const portId = portMap.get(rule.portName)
    if (!portId) {
      console.log(`  ⨯ Port bulunamadı: ${rule.portName}`)
      continue
    }

    const t = rule.tiers
    const is20 = rule.containerType.startsWith("20")
    const price = (p20: number, p40: number) => is20 ? p20 : p40

    const tier1To = t[0].to === INF ? 365 : t[0].to
    const tier2From = t.length > 1 ? t[1].from : tier1To + 1
    const tier2To = t.length > 1 ? (t[1].to === INF ? 365 : t[1].to) : tier2From
    const tier3From = t.length > 2 ? t[2].from : tier2To + 1
    const tier2Price = t.length > 1 ? price(t[1].price20, t[1].price40) : 0
    const tier3Price = t.length > 2 ? price(t[2].price20, t[2].price40) : price(t[t.length - 1].price20, t[t.length - 1].price40)

    const where = {
      portId_shippingCompanyId_containerType_imoCargo_effectiveFrom: {
        portId,
        shippingCompanyId: carrier.id,
        containerType: rule.containerType,
        imoCargo: false,
        effectiveFrom,
      },
    }

    const data = {
      portId,
      shippingCompanyId: carrier.id,
      containerType: rule.containerType,
      tier1DaysFrom: t[0].from,
      tier1DaysTo: tier1To,
      tier1PricePerDay: price(t[0].price20, t[0].price40),
      tier2DaysFrom: tier2From,
      tier2DaysTo: tier2To,
      tier2PricePerDay: tier2Price,
      tier3DaysFrom: tier3From,
      tier3PricePerDay: tier3Price,
      currency: "USD",
      effectiveFrom,
      isActive: true,
      notes: `${rule.category} - Maersk ${rule.portName} ${rule.containerType}`,
    }

    const existing = await prisma.tariffRule.findUnique({ where })
    if (existing) {
      await prisma.tariffRule.update({ where: { id: existing.id }, data })
      skipped++
    } else {
      await prisma.tariffRule.create({ data })
      created++
    }
  }

  console.log(`\nTarife: ${created} oluşturuldu, ${skipped} güncellendi (toplam ${allRules.length})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
