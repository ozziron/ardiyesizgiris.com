import { describe, it, expect } from "vitest"
import { tariffPackSchema } from "./pack-schema"
import {
  tiersToColumns,
  expandPack,
  checkCoverage,
  comparableProjection,
  OPEN_ENDED_SENTINEL,
} from "./expand"

// Minimal geçerli pack üreticisi — testler bunun üzerinde varyasyon yapar.
function validPack(overrides: Record<string, unknown> = {}) {
  return {
    carrier: { code: "MSCU", name: "MSC" },
    meta: { source: "user-pdf", verified: false },
    defaults: { currency: "USD", effectiveFrom: "2026-01-01", effectiveUntil: null },
    surcharges: [],
    coverage: { ports: ["IST-KUMPORT"], exceptions: [], portDefs: [], containerTypeDefs: [] },
    ruleGroups: [
      {
        name: "Dry",
        containerTypes: ["20DC", "40DC"],
        imoCargo: false,
        ports: {
          "IST-KUMPORT": {
            tiers: [
              { from: 1, to: 8, prices: { "20DC": 0, "40DC": 0 } },
              { from: 9, to: 14, prices: { "20DC": 15, "40DC": 30 } },
              { from: 15, to: null, prices: { "20DC": 30, "40DC": 60 } },
            ],
          },
        },
      },
    ],
    ...overrides,
  }
}

function tiersOf(pack: ReturnType<typeof validPack>) {
  return (pack.ruleGroups[0] as { ports: Record<string, { tiers: unknown[] }> }).ports[
    "IST-KUMPORT"
  ]!.tiers
}

describe("tariffPackSchema", () => {
  it("geçerli pack'i kabul eder", () => {
    expect(tariffPackSchema.safeParse(validPack()).success).toBe(true)
  })

  it("tier'lar arasında boşluk varsa reddeder", () => {
    const pack = validPack()
    tiersOf(pack)[1] = { from: 10, to: 14, prices: { "20DC": 15, "40DC": 30 } } // 9 değil 10
    const result = tariffPackSchema.safeParse(pack)
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain("bitişik")
  })

  it("kapalı son tier'ı reddeder (açık uçlu olmalı)", () => {
    const pack = validPack()
    tiersOf(pack)[2] = { from: 15, to: 30, prices: { "20DC": 30, "40DC": 60 } }
    expect(tariffPackSchema.safeParse(pack).success).toBe(false)
  })

  it("1. günden başlamayan tier tablosunu reddeder", () => {
    const pack = validPack()
    tiersOf(pack)[0] = { from: 2, to: 8, prices: { "20DC": 0, "40DC": 0 } }
    expect(tariffPackSchema.safeParse(pack).success).toBe(false)
  })

  it("4 tier'ı reddeder (şema en fazla 3 destekler)", () => {
    const pack = validPack()
    tiersOf(pack).splice(
      2,
      1,
      { from: 15, to: 20, prices: { "20DC": 30, "40DC": 60 } },
      { from: 21, to: null, prices: { "20DC": 45, "40DC": 90 } },
    )
    expect(tariffPackSchema.safeParse(pack).success).toBe(false)
  })

  it("gruptaki bir tip için fiyat eksikse reddeder", () => {
    const pack = validPack()
    tiersOf(pack)[0] = { from: 1, to: 8, prices: { "20DC": 0 } } // 40DC eksik
    const result = tariffPackSchema.safeParse(pack)
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain("40DC")
  })

  it("aynı (liman × tip) iki grupta tanımlanırsa reddeder", () => {
    const pack = validPack()
    const groups = pack.ruleGroups as unknown[]
    groups.push(JSON.parse(JSON.stringify(groups[0])))
    const result = tariffPackSchema.safeParse(pack)
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain("Çakışma")
  })
})

describe("tiersToColumns", () => {
  it("3 tier'ı doğru kolonlara eşler", () => {
    const cols = tiersToColumns(
      [
        { from: 1, to: 8, prices: { "20DC": 0 } },
        { from: 9, to: 14, prices: { "20DC": 15 } },
        { from: 15, to: null, prices: { "20DC": 30 } },
      ],
      "20DC",
    )
    expect(cols).toMatchObject({
      tier1DaysFrom: 1, tier1DaysTo: 8, tier1PricePerDay: 0,
      tier2DaysFrom: 9, tier2DaysTo: 14, tier2PricePerDay: 15, tier2Enabled: true,
      tier3DaysFrom: 15, tier3PricePerDay: 30, tier3Enabled: true,
    })
  })

  it("2 tier'da tier3'ü kapatır, açık uçlu tier2'ye sentinel yazar", () => {
    const cols = tiersToColumns(
      [
        { from: 1, to: 5, prices: { "40DC": 0 } },
        { from: 6, to: null, prices: { "40DC": 50 } },
      ],
      "40DC",
    )
    expect(cols.tier2Enabled).toBe(true)
    expect(cols.tier2DaysTo).toBe(OPEN_ENDED_SENTINEL)
    expect(cols.tier3Enabled).toBe(false)
    expect(cols.tier3DaysFrom).toBe(OPEN_ENDED_SENTINEL + 1)
  })

  it("tek tier'da (flat) tier2 ve tier3'ü kapatır", () => {
    const cols = tiersToColumns([{ from: 1, to: null, prices: { "20DC": 10 } }], "20DC")
    expect(cols).toMatchObject({
      tier1DaysTo: OPEN_ENDED_SENTINEL,
      tier2Enabled: false,
      tier3Enabled: false,
      tier1PricePerDay: 10,
    })
  })
})

describe("expandPack", () => {
  it("liman × tip başına bir kural üretir, default'ları uygular", () => {
    const pack = tariffPackSchema.parse(validPack())
    const rules = expandPack(pack)
    expect(rules).toHaveLength(2) // 1 liman × 2 tip
    const r20 = rules.find((r) => r.containerType === "20DC")!
    expect(r20.currency).toBe("USD")
    expect(r20.effectiveFrom).toBe("2026-01-01")
    expect(r20.tier2PricePerDay).toBe(15)
    const r40 = rules.find((r) => r.containerType === "40DC")!
    expect(r40.tier2PricePerDay).toBe(30)
  })

  it("liman bazlı currency/effectiveFrom override'ını uygular", () => {
    const raw = validPack()
    const group = raw.ruleGroups[0] as {
      ports: Record<string, Record<string, unknown>>
    }
    group.ports["IST-KUMPORT"] = {
      ...group.ports["IST-KUMPORT"],
      currency: "EUR",
      effectiveFrom: "2026-03-01",
    }
    const rules = expandPack(tariffPackSchema.parse(raw))
    expect(rules[0]!.currency).toBe("EUR")
    expect(rules[0]!.effectiveFrom).toBe("2026-03-01")
  })
})

describe("checkCoverage", () => {
  const universe = { portCodes: ["IST-KUMPORT", "IST-MARPORT"], containerTypeCodes: ["20DC", "40DC"] }

  it("eksik kombinasyonları bulur", () => {
    const pack = tariffPackSchema.parse(validPack())
    const { missing } = checkCoverage(pack, universe)
    expect(missing).toEqual([
      { port: "IST-MARPORT", containerType: "20DC" },
      { port: "IST-MARPORT", containerType: "40DC" },
    ])
  })

  it("wildcard exception eksikleri kapatır", () => {
    const raw = validPack()
    ;(raw.coverage as { exceptions: unknown[] }).exceptions = [
      { port: "IST-MARPORT", containerType: "*", reason: "Bu limana uğramıyor" },
    ]
    const { missing, excepted } = checkCoverage(tariffPackSchema.parse(raw), universe)
    expect(missing).toHaveLength(0)
    expect(excepted).toBe(2)
  })
})

describe("comparableProjection", () => {
  const base = {
    tier1DaysFrom: 1, tier1DaysTo: 8, tier1PricePerDay: 0,
    tier2DaysFrom: 9, tier2DaysTo: 14, tier2PricePerDay: 15, tier2Enabled: true,
    tier3DaysFrom: 15, tier3PricePerDay: 30, tier3Enabled: true,
    currency: "USD", effectiveUntil: null,
  }

  it("Decimal-string ve number fiyatları eşit sayar", () => {
    const a = comparableProjection({ ...base, tier2PricePerDay: 15 })
    const b = comparableProjection({ ...base, tier2PricePerDay: { toString: () => "15.00" } })
    expect(a).toEqual(b)
  })

  it("devre dışı tier'ın placeholder kolonlarını yok sayar", () => {
    const a = comparableProjection({ ...base, tier3Enabled: false, tier3PricePerDay: 0, tier3DaysFrom: 366 })
    const b = comparableProjection({ ...base, tier3Enabled: false, tier3PricePerDay: 999, tier3DaysFrom: 15 })
    expect(a).toEqual(b)
  })

  it("gerçek fiyat farkını yakalar", () => {
    const a = comparableProjection(base)
    const b = comparableProjection({ ...base, tier3PricePerDay: 35 })
    expect(a).not.toEqual(b)
  })

  it("son aktif tier'ın DaysTo kolonunu yok sayar (hesaplamada kullanılmaz)", () => {
    // tier2 son aktif tier: DB'de 100, pack'ten 365 sentinel gelse de eşit sayılmalı
    const a = comparableProjection({ ...base, tier3Enabled: false, tier2DaysTo: 100 })
    const b = comparableProjection({ ...base, tier3Enabled: false, tier2DaysTo: 365 })
    expect(a).toEqual(b)
    // yalnızca tier1 aktifken tier1DaysTo da yok sayılır
    const c = comparableProjection({ ...base, tier2Enabled: false, tier3Enabled: false, tier1DaysTo: 100 })
    const d = comparableProjection({ ...base, tier2Enabled: false, tier3Enabled: false, tier1DaysTo: 365 })
    expect(c).toEqual(d)
  })
})

describe("effectiveUntil taşınması", () => {
  it("pack default'u kurallara uygular, liman override'ı önceliklidir", () => {
    const raw = validPack()
    ;(raw.defaults as Record<string, unknown>).effectiveUntil = "2026-12-31"
    const rules = expandPack(tariffPackSchema.parse(raw))
    expect(rules[0]!.effectiveUntil).toBe("2026-12-31")

    const group = raw.ruleGroups[0] as { ports: Record<string, Record<string, unknown>> }
    group.ports["IST-KUMPORT"] = { ...group.ports["IST-KUMPORT"], effectiveUntil: null }
    const overridden = expandPack(tariffPackSchema.parse(raw))
    expect(overridden[0]!.effectiveUntil).toBeNull() // null = açıkça süresiz
  })
})
