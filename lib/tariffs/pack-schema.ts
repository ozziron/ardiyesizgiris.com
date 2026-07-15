import { z } from "zod"

// ---------------------------------------------------------------------------
// Carrier Tariff Pack — kanonik veri formatı
//
// Bir JSON dosyası = bir armatörün tüm tarife verisi (data/tariffs/<code>.json).
// PDF/e-posta/web kaynaklarından database agent tarafından normalize edilir,
// prisma/import-tariffs.ts ile DB'ye uygulanır, prisma/export-tariffs.ts ile
// DB'den geri üretilir (yedek + regresyon kanıtı).
//
// Tier modeli DB ile aynıdır: 1-3 bitişik artan aralık, son tier daima açık
// uçlu (to: null). Hesaplama motoru son AKTİF tier'ı açık uçlu saydığı için
// (lib/calculations/calculate-tariff.ts) kapalı son tier yanlış fiyat üretir;
// şema bunu reddeder.
// ---------------------------------------------------------------------------

export const PACK_SOURCES = [
  "user-pdf",
  "user-screenshot",
  "user-email",
  "web-draft",
  "prod-export",
] as const

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalı")

const tierSpecSchema = z.object({
  from: z.number().int().min(1),
  // null = açık uçlu (yalnızca son tier'da geçerli)
  to: z.number().int().min(1).nullable(),
  // Konteyner tipi kodu -> günlük fiyat. Gruptaki HER tip için anahtar zorunlu.
  prices: z.record(z.string(), z.number().min(0)),
})

const portRulesSchema = z.object({
  tiers: z.array(tierSpecSchema).min(1).max(3),
  // Opsiyonel pack-default override'ları (currency/effectiveFrom: null = default)
  currency: z.string().min(3).max(3).nullable().optional(),
  effectiveFrom: isoDate.nullable().optional(),
  // effectiveUntil: alan YOKSA default kullanılır; null = açıkça süresiz
  effectiveUntil: isoDate.nullable().optional(),
  notes: z.string().nullable().optional(),
})

const ruleGroupSchema = z.object({
  // İnsan için etiket, ör. "Dry", "Reefer" — DB'ye yazılmaz, notes'a girer
  name: z.string().optional(),
  containerTypes: z.array(z.string().min(2)).min(1),
  imoCargo: z.boolean().default(false),
  // Liman kodu -> tier tablosu
  ports: z.record(z.string(), portRulesSchema),
})

const surchargeSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3).default("USD"),
  applyType: z.string().default("PER_CONTAINER"),
  // Boş dizi = tüm tipler (CarrierSurcharge.containerTypes ile aynı anlam)
  containerTypes: z.array(z.string()).default([]),
})

const exceptionSchema = z.object({
  port: z.string(), // "*" = tüm limanlar
  containerType: z.string(), // "*" = tüm tipler
  reason: z.string().min(3, "Exception gerekçesi zorunlu"),
})

// Hedef DB'de bulunmayan liman/tip yalnızca --create-taxonomy ile ve bu
// tanımlar üzerinden oluşturulabilir (export bunları her zaman doldurur).
const portDefSchema = z.object({
  code: z.string(),
  name: z.string(),
  city: z.string().nullable().optional(),
  country: z.string().default("TR"),
})

const containerTypeDefSchema = z.object({
  code: z.string(),
  label: z.string(),
  displayOrder: z.number().int().default(0),
})

export const tariffPackSchema = z
  .object({
    carrier: z.object({
      code: z.string().min(2).max(10),
      name: z.string().min(1),
    }),
    meta: z.object({
      source: z.enum(PACK_SOURCES),
      sourceRef: z.string().nullable().optional(),
      receivedAt: isoDate.nullable().optional(),
      // Yalnızca kullanıcı onayıyla true yapılır; --apply bunu şart koşar.
      verified: z.boolean(),
      verifiedBy: z.string().nullable().optional(),
      verifiedAt: isoDate.nullable().optional(),
      notes: z.string().nullable().optional(),
    }),
    defaults: z.object({
      currency: z.string().min(3).max(3).default("USD"),
      effectiveFrom: isoDate,
      effectiveUntil: isoDate.nullable().optional(),
    }),
    surcharges: z.array(surchargeSchema).default([]),
    coverage: z.object({
      ports: z.array(z.string()).min(1),
      exceptions: z.array(exceptionSchema).default([]),
      portDefs: z.array(portDefSchema).default([]),
      containerTypeDefs: z.array(containerTypeDefSchema).default([]),
    }),
    ruleGroups: z.array(ruleGroupSchema).min(1),
  })
  .superRefine((pack, ctx) => {
    for (const [gi, group] of pack.ruleGroups.entries()) {
      const gPath = ["ruleGroups", gi]
      for (const [portCode, portRules] of Object.entries(group.ports)) {
        const pPath = [...gPath, "ports", portCode, "tiers"]
        const tiers = portRules.tiers

        // Son tier açık uçlu olmalı, öncekiler kapalı olmalı
        for (const [ti, tier] of tiers.entries()) {
          const isLast = ti === tiers.length - 1
          if (isLast && tier.to !== null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [...pPath, ti, "to"],
              message: `Son tier açık uçlu olmalı (to: null) — hesaplama motoru son aktif tier'ı açık uçlu sayar`,
            })
          }
          if (!isLast && tier.to === null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [...pPath, ti, "to"],
              message: `Yalnızca son tier açık uçlu olabilir`,
            })
          }
        }

        // Bitişik artan aralıklar: 1'den başlar, boşluk/çakışma yok
        if (tiers[0] && tiers[0].from !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...pPath, 0, "from"],
            message: `İlk tier 1. günden başlamalı`,
          })
        }
        for (let ti = 1; ti < tiers.length; ti++) {
          const prev = tiers[ti - 1]!
          const cur = tiers[ti]!
          if (prev.to !== null && cur.from !== prev.to + 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [...pPath, ti, "from"],
              message: `Tier'lar bitişik olmalı: ${prev.to} gününden sonra ${prev.to + 1} beklenirdi, ${cur.from} bulundu`,
            })
          }
        }
        if (tiers.some((t, ti) => ti < tiers.length - 1 && t.to !== null && t.to < t.from)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: pPath,
            message: `Tier aralığı geçersiz (to < from)`,
          })
        }

        // Her tier gruptaki her konteyner tipi için fiyat içermeli
        for (const [ti, tier] of tiers.entries()) {
          for (const ct of group.containerTypes) {
            if (!(ct in tier.prices)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [...pPath, ti, "prices"],
                message: `'${ct}' tipi için fiyat eksik`,
              })
            }
          }
        }
      }
    }

    // Aynı (liman × tip × imoCargo) iki grupta tanımlanamaz
    const seen = new Map<string, number>()
    for (const [gi, group] of pack.ruleGroups.entries()) {
      for (const portCode of Object.keys(group.ports)) {
        for (const ct of group.containerTypes) {
          const key = `${portCode}|${ct}|${group.imoCargo}`
          if (seen.has(key)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["ruleGroups", gi],
              message: `Çakışma: ${portCode} × ${ct} (imo=${group.imoCargo}) hem grup ${seen.get(key)} hem grup ${gi} içinde`,
            })
          } else {
            seen.set(key, gi)
          }
        }
      }
    }
  })

export type TariffPack = z.infer<typeof tariffPackSchema>
export type TierSpec = z.infer<typeof tierSpecSchema>
export type RuleGroup = z.infer<typeof ruleGroupSchema>
export type PackSurcharge = z.infer<typeof surchargeSchema>
