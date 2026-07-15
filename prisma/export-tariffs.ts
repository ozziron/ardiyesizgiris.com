import { writeFileSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import type { TariffPack } from "../lib/tariffs/pack-schema"
import {
  makeClient,
  parseArgs,
  resolveDbTarget,
  toIsoDate,
  type DbTarget,
} from "./tariff-cli-utils"

// ---------------------------------------------------------------------------
// Bir armatörün DB'deki tarife verisini pack JSON'a döker.
//
//   npm run db:export-tariffs -- --carrier MAEU [--db prod] [--out <dosya>]
//
// Kullanım amaçları: prod envanter raporu, apply öncesi yedek, round-trip
// regresyon kanıtı (export → import dry-run → tamamı UNCHANGED olmalı).
// Salt-okunur: DB'ye hiçbir şey yazmaz.
// ---------------------------------------------------------------------------

interface DbRule {
  containerType: string
  imoCargo: boolean
  tier1DaysFrom: number
  tier1DaysTo: number
  tier1PricePerDay: unknown
  tier2DaysFrom: number
  tier2DaysTo: number
  tier2PricePerDay: unknown
  tier2Enabled: boolean
  tier3DaysFrom: number
  tier3PricePerDay: unknown
  tier3Enabled: boolean
  currency: string
  effectiveFrom: Date
  effectiveUntil: Date | null
}

/** DB satırından tier sınır imzası (fiyatsız) — gruplama anahtarının parçası. */
function boundarySignature(r: DbRule): string {
  if (r.tier3Enabled) {
    return `3|${r.tier1DaysFrom}-${r.tier1DaysTo}|${r.tier2DaysFrom}-${r.tier2DaysTo}|${r.tier3DaysFrom}+`
  }
  if (r.tier2Enabled) {
    return `2|${r.tier1DaysFrom}-${r.tier1DaysTo}|${r.tier2DaysFrom}+`
  }
  return `1|${r.tier1DaysFrom}+`
}

/** DB satırını pack tier listesine çevirir (fiyatlar tek tip için). */
function rowToTiers(r: DbRule): Array<{ from: number; to: number | null; price: number }> {
  const money = (v: unknown) => Number(v)
  if (r.tier3Enabled) {
    return [
      { from: r.tier1DaysFrom, to: r.tier1DaysTo, price: money(r.tier1PricePerDay) },
      { from: r.tier2DaysFrom, to: r.tier2DaysTo, price: money(r.tier2PricePerDay) },
      { from: r.tier3DaysFrom, to: null, price: money(r.tier3PricePerDay) },
    ]
  }
  if (r.tier2Enabled) {
    return [
      { from: r.tier1DaysFrom, to: r.tier1DaysTo, price: money(r.tier1PricePerDay) },
      { from: r.tier2DaysFrom, to: null, price: money(r.tier2PricePerDay) },
    ]
  }
  return [{ from: r.tier1DaysFrom, to: null, price: money(r.tier1PricePerDay) }]
}

async function main() {
  const { options } = parseArgs(process.argv.slice(2))
  const carrierCode = options["--carrier"]
  if (!carrierCode) {
    console.error("Kullanım: npm run db:export-tariffs -- --carrier MAEU [--db prod] [--out dosya]")
    process.exit(1)
  }
  const target: DbTarget = resolveDbTarget(options)
  const prisma = makeClient(target)

  try {
    const carrier = await prisma.shippingCompany.findUnique({ where: { code: carrierCode } })
    if (!carrier) {
      console.error(`❌ Armatör bulunamadı: ${carrierCode} (${target} DB)`)
      process.exit(1)
    }

    const ports = await prisma.port.findMany({ orderBy: { code: "asc" } })
    const types = await prisma.containerType.findMany({ orderBy: { displayOrder: "asc" } })
    const portById = new Map(ports.map((p) => [p.id, p]))

    const rules = await prisma.tariffRule.findMany({
      where: { shippingCompanyId: carrier.id, isActive: true },
      orderBy: [{ portId: "asc" }, { containerType: "asc" }],
    })
    const inactiveCount = await prisma.tariffRule.count({
      where: { shippingCompanyId: carrier.id, isActive: false },
    })
    const surcharges = await prisma.carrierSurcharge.findMany({
      where: { shippingCompanyId: carrier.id, isActive: true },
    })

    console.log(`\n═══ Tarife Export: ${carrier.name} (${carrier.code}) — ${target} DB ═══`)
    console.log(`Aktif kural: ${rules.length} | Pasif (dahil edilmedi): ${inactiveCount}`)
    console.log(`Limanlar (DB): ${ports.length} | Tipler (DB): ${types.length} | Surcharge: ${surcharges.length}`)

    // Varsayılanlar: en yaygın currency ve effectiveFrom
    const mode = <T>(values: T[]): T | undefined => {
      const counts = new Map<T, number>()
      for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
      return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    }
    const defaultCurrency = mode(rules.map((r) => r.currency)) ?? "USD"
    const defaultEffectiveFrom =
      mode(rules.map((r) => toIsoDate(r.effectiveFrom))) ?? toIsoDate(new Date())
    const defaultEffectiveUntil =
      mode(rules.map((r) => (r.effectiveUntil ? toIsoDate(r.effectiveUntil) : null))) ?? null

    // Gruplama: (liman × imo × sınır imzası × currency × effectiveFrom ×
    // effectiveUntil) aynı olan satırlar tek ruleGroup'ta, tipler prices
    // haritasında birleşir.
    const groups = new Map<
      string,
      {
        portCode: string
        imoCargo: boolean
        currency: string
        effectiveFrom: string
        effectiveUntil: string | null
        containerTypes: string[]
        tiers: Array<{ from: number; to: number | null; prices: Record<string, number> }>
      }
    >()

    for (const r of rules) {
      const port = portById.get(r.portId)
      if (!port) continue
      const effFrom = toIsoDate(r.effectiveFrom)
      const effUntil = r.effectiveUntil ? toIsoDate(r.effectiveUntil) : null
      const key = `${port.code}|${r.imoCargo}|${boundarySignature(r)}|${r.currency}|${effFrom}|${effUntil}`
      const tiers = rowToTiers(r)

      let group = groups.get(key)
      if (!group) {
        group = {
          portCode: port.code,
          imoCargo: r.imoCargo,
          currency: r.currency,
          effectiveFrom: effFrom,
          effectiveUntil: effUntil,
          containerTypes: [],
          tiers: tiers.map((t) => ({ from: t.from, to: t.to, prices: {} })),
        }
        groups.set(key, group)
      }
      group.containerTypes.push(r.containerType)
      for (const [i, t] of tiers.entries()) {
        group.tiers[i]!.prices[r.containerType] = t.price
      }
    }

    // Kapsam: evrende olup kuralı olmayan kombinasyonlar exception olur
    const covered = new Set<string>()
    for (const r of rules) {
      const port = portById.get(r.portId)
      if (port && !r.imoCargo) covered.add(`${port.code}|${r.containerType}`)
    }
    const exceptions: Array<{ port: string; containerType: string; reason: string }> = []
    for (const port of ports.filter((p) => p.isActive)) {
      for (const t of types.filter((t) => t.isActive)) {
        if (!covered.has(`${port.code}|${t.code}`)) {
          exceptions.push({
            port: port.code,
            containerType: t.code,
            reason: "DB'de aktif kural yok (export sırasında tespit edildi)",
          })
        }
      }
    }
    if (exceptions.length > 0) {
      console.log(`⚠️  Kuralsız kombinasyon: ${exceptions.length} (exception olarak işaretlendi — sitede hesaplanamaz)`)
      for (const e of exceptions.slice(0, 10)) console.log(`  - ${e.port} × ${e.containerType}`)
      if (exceptions.length > 10) console.log(`  ... ve ${exceptions.length - 10} tane daha`)
    }

    const pack: TariffPack = {
      carrier: { code: carrier.code, name: carrier.name },
      meta: {
        source: "prod-export",
        sourceRef: `${target} DB export`,
        receivedAt: toIsoDate(new Date()),
        verified: true, // DB'de zaten canlı olan veri
        verifiedBy: "export",
        verifiedAt: toIsoDate(new Date()),
        notes: null,
      },
      defaults: {
        currency: defaultCurrency,
        effectiveFrom: defaultEffectiveFrom,
        effectiveUntil: defaultEffectiveUntil,
      },
      surcharges: surcharges.map((s) => ({
        name: s.name,
        description: s.description,
        amount: Number(s.amount),
        currency: s.currency,
        applyType: s.applyType,
        containerTypes: s.containerTypes,
      })),
      coverage: {
        ports: [...new Set(rules.map((r) => portById.get(r.portId)?.code).filter(Boolean))] as string[],
        exceptions,
        portDefs: ports.map((p) => ({
          code: p.code,
          name: p.name,
          city: p.city,
          country: p.country,
        })),
        containerTypeDefs: types.map((t) => ({
          code: t.code,
          label: t.label,
          displayOrder: t.displayOrder,
        })),
      },
      ruleGroups: [...groups.values()].map((g) => ({
        name: undefined,
        containerTypes: g.containerTypes.sort(),
        imoCargo: g.imoCargo,
        ports: {
          [g.portCode]: {
            tiers: g.tiers,
            currency: g.currency !== defaultCurrency ? g.currency : null,
            effectiveFrom: g.effectiveFrom !== defaultEffectiveFrom ? g.effectiveFrom : null,
            // Alan yoksa default kullanılır; null = açıkça süresiz. Default ile
            // aynıysa alan hiç yazılmaz (undefined → JSON'da yok).
            ...(g.effectiveUntil !== defaultEffectiveUntil
              ? { effectiveUntil: g.effectiveUntil }
              : {}),
            notes: null,
          },
        },
      })),
    }

    const outPath = resolve(
      process.cwd(),
      options["--out"] ?? `data/tariffs/${carrier.code.toLowerCase()}-${target}-export.json`,
    )
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, JSON.stringify(pack, null, 2) + "\n", "utf8")
    console.log(`\n✓ Export yazıldı: ${outPath}`)
    console.log(`  ruleGroups: ${pack.ruleGroups.length} | kural: ${rules.length} | exception: ${exceptions.length}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
