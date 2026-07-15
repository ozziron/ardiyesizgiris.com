import type { TariffPack, TierSpec } from "./pack-schema"

// ---------------------------------------------------------------------------
// Pack <-> TariffRule kolon eşlemesi. Saf fonksiyonlar — Prisma import'u yok,
// Vitest ile DB'siz test edilir.
//
// Kolon kuralları (calculate-tariff.ts davranışıyla uyumlu):
// - Son aktif tier açık uçlu sayılır; açık uçlu tier'ın DaysTo kolonu 365
//   sentinel'i ile doldurulur (eski seed konvansiyonu).
// - Fiyat kolonları nullable değil; devre dışı tier'lara deterministik
//   placeholder yazılır (From = önceki To + 1, fiyat 0) ve diff'te yok sayılır.
// ---------------------------------------------------------------------------

export const OPEN_ENDED_SENTINEL = 365

/** DB'ye yazılacak, karşılaştırılabilir düz kural temsili. */
export interface FlatRule {
  portCode: string
  containerType: string
  imoCargo: boolean
  tier1DaysFrom: number
  tier1DaysTo: number
  tier1PricePerDay: number
  tier2DaysFrom: number
  tier2DaysTo: number
  tier2PricePerDay: number
  tier2Enabled: boolean
  tier3DaysFrom: number
  tier3PricePerDay: number
  tier3Enabled: boolean
  currency: string
  effectiveFrom: string // YYYY-MM-DD
  effectiveUntil: string | null
  notes: string | null
}

function priceFor(tier: TierSpec, containerType: string): number {
  const p = tier.prices[containerType]
  if (p === undefined) {
    throw new Error(`'${containerType}' için fiyat yok (şema doğrulaması atlanmış olmalı)`)
  }
  return p
}

/** Bir grubun tek limandaki tier tablosunu tek konteyner tipi için kolonlara indirger. */
export function tiersToColumns(
  tiers: TierSpec[],
  containerType: string,
): Pick<
  FlatRule,
  | "tier1DaysFrom" | "tier1DaysTo" | "tier1PricePerDay"
  | "tier2DaysFrom" | "tier2DaysTo" | "tier2PricePerDay" | "tier2Enabled"
  | "tier3DaysFrom" | "tier3PricePerDay" | "tier3Enabled"
> {
  const t1 = tiers[0]!
  const t2 = tiers[1]
  const t3 = tiers[2]

  const tier1DaysTo = t1.to ?? OPEN_ENDED_SENTINEL
  const tier2DaysFrom = t2 ? t2.from : tier1DaysTo + 1
  const tier2DaysTo = t2 ? (t2.to ?? OPEN_ENDED_SENTINEL) : tier2DaysFrom
  const tier3DaysFrom = t3 ? t3.from : tier2DaysTo + 1

  return {
    tier1DaysFrom: t1.from,
    tier1DaysTo,
    tier1PricePerDay: priceFor(t1, containerType),
    tier2DaysFrom,
    tier2DaysTo,
    tier2PricePerDay: t2 ? priceFor(t2, containerType) : 0,
    tier2Enabled: Boolean(t2),
    tier3DaysFrom,
    tier3PricePerDay: t3 ? priceFor(t3, containerType) : 0,
    tier3Enabled: Boolean(t3),
  }
}

/** Pack'i (liman × tip) başına bir FlatRule listesine açar. */
export function expandPack(pack: TariffPack): FlatRule[] {
  const rules: FlatRule[] = []
  for (const group of pack.ruleGroups) {
    for (const [portCode, portRules] of Object.entries(group.ports)) {
      for (const containerType of group.containerTypes) {
        rules.push({
          portCode,
          containerType,
          imoCargo: group.imoCargo,
          ...tiersToColumns(portRules.tiers, containerType),
          currency: portRules.currency ?? pack.defaults.currency,
          effectiveFrom: portRules.effectiveFrom ?? pack.defaults.effectiveFrom,
          // undefined = pack default; null = açıkça süresiz
          effectiveUntil:
            portRules.effectiveUntil !== undefined
              ? portRules.effectiveUntil
              : (pack.defaults.effectiveUntil ?? null),
          notes: portRules.notes ?? (group.name ? `${group.name} - ${pack.carrier.name}` : null),
        })
      }
    }
  }
  return rules
}

/**
 * Diff için normalize edilmiş projeksiyon: devre dışı tier'ların placeholder
 * kolonları ve (varsayılan olarak) notes karşılaştırma dışıdır. Fiyatlar
 * Decimal/number farkını gidermek için 2 haneye sabitlenir.
 */
export function comparableProjection(
  r: {
    tier1DaysFrom: number
    tier1DaysTo: number
    tier1PricePerDay: number | { toString(): string }
    tier2DaysFrom: number
    tier2DaysTo: number
    tier2PricePerDay: number | { toString(): string }
    tier2Enabled: boolean
    tier3DaysFrom: number
    tier3PricePerDay: number | { toString(): string }
    tier3Enabled: boolean
    currency: string
    effectiveUntil: Date | string | null
    isActive?: boolean
  },
  opts: { includeNotes?: boolean; notes?: string | null } = {},
): Record<string, string | number | boolean | null> {
  const money = (v: number | { toString(): string }) => Number(v).toFixed(2)
  const date = (v: Date | string | null) =>
    v === null ? null : typeof v === "string" ? v : v.toISOString().slice(0, 10)

  const proj: Record<string, string | number | boolean | null> = {
    tier1DaysFrom: r.tier1DaysFrom,
    tier1PricePerDay: money(r.tier1PricePerDay),
    tier2Enabled: r.tier2Enabled,
    tier3Enabled: r.tier3Enabled,
    currency: r.currency,
    effectiveUntil: date(r.effectiveUntil),
    isActive: r.isActive ?? true,
  }
  // Son AKTİF tier'ın DaysTo kolonu hesaplamada kullanılmaz (motor son tier'ı
  // açık uçlu sayar) — karşılaştırma dışı bırakılır ki 100 vs 365 gibi
  // anlamsız sentinel farkları diff üretmesin.
  if (r.tier2Enabled) {
    proj.tier1DaysTo = r.tier1DaysTo
    proj.tier2DaysFrom = r.tier2DaysFrom
    proj.tier2PricePerDay = money(r.tier2PricePerDay)
    if (r.tier3Enabled) {
      proj.tier2DaysTo = r.tier2DaysTo
    }
  }
  if (r.tier3Enabled) {
    proj.tier3DaysFrom = r.tier3DaysFrom
    proj.tier3PricePerDay = money(r.tier3PricePerDay)
  }
  if (opts.includeNotes) {
    proj.notes = opts.notes ?? null
  }
  return proj
}

/** (liman × tip × imo) kapsam matrisi kontrolü. Evren hedef DB'den gelir. */
export function checkCoverage(
  pack: TariffPack,
  universe: { portCodes: string[]; containerTypeCodes: string[] },
): { missing: Array<{ port: string; containerType: string }>; excepted: number } {
  const covered = new Set<string>()
  for (const group of pack.ruleGroups) {
    if (group.imoCargo) continue // IMO kapsamı opsiyonel; matris imo=false için
    for (const portCode of Object.keys(group.ports)) {
      for (const ct of group.containerTypes) {
        covered.add(`${portCode}|${ct}`)
      }
    }
  }
  const isExcepted = (port: string, ct: string) =>
    pack.coverage.exceptions.some(
      (e) =>
        (e.port === "*" || e.port === port) &&
        (e.containerType === "*" || e.containerType === ct),
    )

  const missing: Array<{ port: string; containerType: string }> = []
  let excepted = 0
  for (const port of universe.portCodes) {
    for (const ct of universe.containerTypeCodes) {
      if (covered.has(`${port}|${ct}`)) continue
      if (isExcepted(port, ct)) {
        excepted++
      } else {
        missing.push({ port, containerType: ct })
      }
    }
  }
  return { missing, excepted }
}
