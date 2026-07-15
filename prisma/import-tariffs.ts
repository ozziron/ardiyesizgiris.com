import { readFileSync } from "fs"
import { resolve } from "path"
import { tariffPackSchema, type TariffPack } from "../lib/tariffs/pack-schema"
import {
  expandPack,
  checkCoverage,
  comparableProjection,
  type FlatRule,
} from "../lib/tariffs/expand"
import {
  makeClient,
  parseArgs,
  resolveDbTarget,
  toDate,
  toIsoDate,
  type DbTarget,
} from "./tariff-cli-utils"

// ---------------------------------------------------------------------------
// Carrier tariff pack importer.
//
//   npm run db:import-tariffs -- data/tariffs/<code>.json [--apply] [--db prod]
//                                [--create-taxonomy] [--strict-notes]
//
// Varsayılan DRY-RUN: hiçbir şey yazmaz, CREATE/UPDATE/UNCHANGED raporu basar.
// --apply yalnızca meta.verified === true ise çalışır. Upsert-only: satır
// silinmez, başka armatörlere ve farklı effectiveFrom nesillerine dokunulmaz.
// ---------------------------------------------------------------------------

interface RulePlan {
  action: "CREATE" | "UPDATE" | "UNCHANGED"
  rule: FlatRule
  existingId?: string
  changes?: string[]
}

async function main() {
  const { positional, flags, options } = parseArgs(process.argv.slice(2))
  const packPath = positional[0]
  if (!packPath) {
    console.error(
      "Kullanım: npm run db:import-tariffs -- data/tariffs/<code>.json [--apply] [--db prod] [--create-taxonomy] [--strict-notes]",
    )
    process.exit(1)
  }
  const apply = flags.has("--apply")
  const createTaxonomy = flags.has("--create-taxonomy")
  const strictNotes = flags.has("--strict-notes")
  const target: DbTarget = resolveDbTarget(options)

  // 1. Pack'i oku ve doğrula
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), packPath), "utf8"))
  const parsed = tariffPackSchema.safeParse(raw)
  if (!parsed.success) {
    console.error("❌ Pack doğrulaması başarısız:")
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`)
    }
    process.exit(1)
  }
  const pack: TariffPack = parsed.data

  console.log(`\n═══ Tarife Import: ${pack.carrier.name} (${pack.carrier.code}) ═══`)
  console.log(`Hedef DB : ${target}${target === "prod" ? "  ⚠️  CANLI VERİTABANI" : ""}`)
  console.log(`Mod      : ${apply ? "APPLY (yazma AÇIK)" : "DRY-RUN (yazma yok)"}`)
  console.log(
    `Kaynak   : ${pack.meta.source}${pack.meta.sourceRef ? ` (${pack.meta.sourceRef})` : ""} | verified: ${pack.meta.verified}`,
  )
  if (pack.meta.source === "web-draft") {
    console.log(`⚠️  WEB TASLAĞI — kullanıcı doğrulaması olmadan DB'ye yazılamaz`)
  }

  const prisma = makeClient(target)
  try {
    // 2. Taksonomi: limanlar ve konteyner tipleri hedef DB'de var mı?
    const dbPorts = await prisma.port.findMany()
    const dbTypes = await prisma.containerType.findMany()
    const portByCode = new Map(dbPorts.map((p) => [p.code, p]))
    const typeByCode = new Map(dbTypes.map((t) => [t.code, t]))

    const usedPortCodes = new Set<string>()
    const usedTypeCodes = new Set<string>()
    for (const g of pack.ruleGroups) {
      for (const pc of Object.keys(g.ports)) usedPortCodes.add(pc)
      for (const ct of g.containerTypes) usedTypeCodes.add(ct)
    }

    const missingPorts = [...usedPortCodes].filter((c) => !portByCode.has(c))
    const missingTypes = [...usedTypeCodes].filter((c) => !typeByCode.has(c))
    const taxonomyPlan: string[] = []

    if (missingPorts.length > 0 || missingTypes.length > 0) {
      if (!createTaxonomy) {
        console.error(
          `\n❌ Hedef DB'de bulunmayan taksonomi (liman/tip oluşturma bilinçli bir karardır; --create-taxonomy ile izin verin):`,
        )
        if (missingPorts.length) console.error(`  Limanlar: ${missingPorts.join(", ")}`)
        if (missingTypes.length) console.error(`  Tipler  : ${missingTypes.join(", ")}`)
        process.exit(1)
      }
      for (const code of missingPorts) {
        const def = pack.coverage.portDefs.find((d) => d.code === code)
        if (!def) {
          console.error(`❌ '${code}' limanı için coverage.portDefs tanımı yok`)
          process.exit(1)
        }
        taxonomyPlan.push(`CREATE port ${def.code} (${def.name})`)
      }
      for (const code of missingTypes) {
        const def = pack.coverage.containerTypeDefs.find((d) => d.code === code)
        if (!def) {
          console.error(`❌ '${code}' tipi için coverage.containerTypeDefs tanımı yok`)
          process.exit(1)
        }
        taxonomyPlan.push(`CREATE containerType ${def.code} (${def.label})`)
      }
    }

    // 3. Kapsam matrisi (hedef DB'nin aktif evrenine göre; yeni oluşturulacak
    //    taksonomi de evrene dahil edilir)
    const universe = {
      portCodes: [
        ...dbPorts.filter((p) => p.isActive).map((p) => p.code),
        ...missingPorts,
      ],
      containerTypeCodes: [
        ...dbTypes.filter((t) => t.isActive).map((t) => t.code),
        ...missingTypes,
      ],
    }
    const coverage = checkCoverage(pack, universe)
    if (coverage.missing.length > 0) {
      console.error(
        `\n❌ Kapsam eksik — ${coverage.missing.length} (liman × tip) kombinasyonu ne kurallı ne exception'lı.`,
      )
      console.error(
        `   Bu kombinasyonlar sitede "tarife bulunamadı" hatası verir. Kural ekleyin veya coverage.exceptions'a gerekçeli kayıt girin:`,
      )
      for (const m of coverage.missing.slice(0, 20)) {
        console.error(`  - ${m.port} × ${m.containerType}`)
      }
      if (coverage.missing.length > 20) {
        console.error(`  ... ve ${coverage.missing.length - 20} tane daha`)
      }
      process.exit(1)
    }

    // 4. Armatör
    const carrier = await prisma.shippingCompany.findUnique({
      where: { code: pack.carrier.code },
    })
    const carrierAction = carrier ? "mevcut" : "CREATE"

    // 5. Kuralları sınıflandır
    const flatRules = expandPack(pack)
    const plans: RulePlan[] = []
    let staleGenerationWarnings = 0

    for (const rule of flatRules) {
      const port = portByCode.get(rule.portCode)
      if (!port || !carrier) {
        plans.push({ action: "CREATE", rule })
        continue
      }
      const existing = await prisma.tariffRule.findUnique({
        where: {
          portId_shippingCompanyId_containerType_imoCargo_effectiveFrom: {
            portId: port.id,
            shippingCompanyId: carrier.id,
            containerType: rule.containerType,
            imoCargo: rule.imoCargo,
            effectiveFrom: toDate(rule.effectiveFrom),
          },
        },
      })

      // Aynı komboda farklı effectiveFrom'lu AKTİF eski nesil var mı? (dokunulmaz, uyarılır)
      const olderActive = await prisma.tariffRule.count({
        where: {
          portId: port.id,
          shippingCompanyId: carrier.id,
          containerType: rule.containerType,
          imoCargo: rule.imoCargo,
          isActive: true,
          effectiveFrom: { not: toDate(rule.effectiveFrom) },
        },
      })
      if (olderActive > 0) staleGenerationWarnings++

      if (!existing) {
        plans.push({ action: "CREATE", rule })
        continue
      }
      const before = comparableProjection(existing, {
        includeNotes: strictNotes,
        notes: existing.notes,
      })
      const after = comparableProjection(
        { ...rule, effectiveUntil: rule.effectiveUntil },
        { includeNotes: strictNotes, notes: rule.notes },
      )
      const changes = Object.keys(after).filter(
        (k) => JSON.stringify(after[k]) !== JSON.stringify(before[k]),
      )
      plans.push(
        changes.length === 0
          ? { action: "UNCHANGED", rule, existingId: existing.id }
          : {
              action: "UPDATE",
              rule,
              existingId: existing.id,
              changes: changes.map((k) => `${k}: ${before[k]} → ${after[k]}`),
            },
      )
    }

    // 6. Surcharge'ları sınıflandır (carrier + name eşleşmesi)
    const surchargePlans: Array<{ action: string; name: string; detail?: string }> = []
    if (carrier) {
      const dbSurcharges = await prisma.carrierSurcharge.findMany({
        where: { shippingCompanyId: carrier.id },
      })
      for (const s of pack.surcharges) {
        const existing = dbSurcharges.find((d) => d.name === s.name)
        if (!existing) {
          surchargePlans.push({ action: "CREATE", name: s.name })
          continue
        }
        const same =
          Number(existing.amount).toFixed(2) === s.amount.toFixed(2) &&
          existing.currency === s.currency &&
          existing.applyType === s.applyType &&
          JSON.stringify([...existing.containerTypes].sort()) ===
            JSON.stringify([...s.containerTypes].sort())
        surchargePlans.push({
          action: same ? "UNCHANGED" : "UPDATE",
          name: s.name,
          detail: same ? undefined : `${existing.amount} ${existing.currency} → ${s.amount} ${s.currency}`,
        })
      }
    } else {
      for (const s of pack.surcharges) {
        surchargePlans.push({ action: "CREATE", name: s.name })
      }
    }

    // 7. Rapor
    const count = (a: string) => plans.filter((p) => p.action === a).length
    console.log(`\n─── Rapor ───`)
    if (taxonomyPlan.length) {
      console.log(`Taksonomi:`)
      for (const t of taxonomyPlan) console.log(`  + ${t}`)
    }
    console.log(`Armatör  : ${pack.carrier.code} → ${carrierAction}`)
    console.log(
      `Kurallar : ${plans.length} toplam | CREATE ${count("CREATE")} | UPDATE ${count("UPDATE")} | UNCHANGED ${count("UNCHANGED")}`,
    )
    for (const p of plans.filter((x) => x.action === "UPDATE").slice(0, 15)) {
      console.log(`  ~ ${p.rule.portCode} × ${p.rule.containerType}:`)
      for (const c of p.changes ?? []) console.log(`      ${c}`)
    }
    const creates = plans.filter((x) => x.action === "CREATE")
    if (creates.length > 0 && creates.length <= 30) {
      for (const p of creates) {
        console.log(`  + ${p.rule.portCode} × ${p.rule.containerType} (${p.rule.currency}, ${p.rule.effectiveFrom})`)
      }
    } else if (creates.length > 30) {
      const byPort = new Map<string, number>()
      for (const p of creates) byPort.set(p.rule.portCode, (byPort.get(p.rule.portCode) ?? 0) + 1)
      for (const [port, n] of byPort) console.log(`  + ${port}: ${n} kural`)
    }
    if (surchargePlans.length) {
      console.log(`Surcharge: ${surchargePlans.map((s) => `${s.name} → ${s.action}${s.detail ? ` (${s.detail})` : ""}`).join(" | ")}`)
    }
    if (coverage.excepted > 0) {
      console.log(`Exception: ${coverage.excepted} kombinasyon kapsam dışı bırakıldı (gerekçeli) — bu kombinasyonlar sitede hesaplanamaz`)
    }
    if (staleGenerationWarnings > 0) {
      console.log(
        `⚠️  ${staleGenerationWarnings} kuralda aynı kombonun farklı effectiveFrom'lu aktif eski nesli var — dokunulmadı; gerekiyorsa admin panelden pasifleştirin`,
      )
    }

    if (!apply) {
      console.log(`\nDRY-RUN tamamlandı — hiçbir şey yazılmadı. Uygulamak için: --apply`)
      return
    }

    // 8. APPLY — güvenlik kapıları
    if (!pack.meta.verified) {
      console.error(
        `\n❌ --apply reddedildi: meta.verified !== true. Bu pack kullanıcı tarafından doğrulanmamış${pack.meta.source === "web-draft" ? " (web taslağı)" : ""}. Doğrulama sonrası verified: true yapılmalı.`,
      )
      process.exit(1)
    }
    if (count("CREATE") + count("UPDATE") === 0 && taxonomyPlan.length === 0) {
      console.log(`\nYazılacak değişiklik yok — DB pack ile zaten senkron.`)
      return
    }

    await prisma.$transaction(
      async (tx) => {
        // Taksonomi
        for (const code of missingPorts) {
          const def = pack.coverage.portDefs.find((d) => d.code === code)!
          await tx.port.create({
            data: { code: def.code, name: def.name, city: def.city ?? null, country: def.country },
          })
        }
        for (const code of missingTypes) {
          const def = pack.coverage.containerTypeDefs.find((d) => d.code === code)!
          await tx.containerType.create({
            data: { code: def.code, label: def.label, displayOrder: def.displayOrder },
          })
        }
        const txPorts = await tx.port.findMany()
        const txPortByCode = new Map(txPorts.map((p) => [p.code, p]))

        // Armatör
        const txCarrier = await tx.shippingCompany.upsert({
          where: { code: pack.carrier.code },
          update: { name: pack.carrier.name, isActive: true },
          create: { code: pack.carrier.code, name: pack.carrier.name },
        })

        // Kurallar (upsert-only)
        for (const plan of plans) {
          if (plan.action === "UNCHANGED") continue
          const rule = plan.rule
          const port = txPortByCode.get(rule.portCode)
          if (!port) throw new Error(`Liman bulunamadı: ${rule.portCode}`)
          const data = {
            portId: port.id,
            shippingCompanyId: txCarrier.id,
            containerType: rule.containerType,
            imoCargo: rule.imoCargo,
            tier1DaysFrom: rule.tier1DaysFrom,
            tier1DaysTo: rule.tier1DaysTo,
            tier1PricePerDay: rule.tier1PricePerDay,
            tier2DaysFrom: rule.tier2DaysFrom,
            tier2DaysTo: rule.tier2DaysTo,
            tier2PricePerDay: rule.tier2PricePerDay,
            tier2Enabled: rule.tier2Enabled,
            tier3DaysFrom: rule.tier3DaysFrom,
            tier3PricePerDay: rule.tier3PricePerDay,
            tier3Enabled: rule.tier3Enabled,
            currency: rule.currency,
            effectiveFrom: toDate(rule.effectiveFrom),
            effectiveUntil: rule.effectiveUntil ? toDate(rule.effectiveUntil) : null,
            isActive: true,
            notes: rule.notes,
          }
          await tx.tariffRule.upsert({
            where: {
              portId_shippingCompanyId_containerType_imoCargo_effectiveFrom: {
                portId: port.id,
                shippingCompanyId: txCarrier.id,
                containerType: rule.containerType,
                imoCargo: rule.imoCargo,
                effectiveFrom: toDate(rule.effectiveFrom),
              },
            },
            update: data,
            create: data,
          })
        }

        // Surcharge'lar (carrier + name üzerinden upsert)
        for (const s of pack.surcharges) {
          const existing = await tx.carrierSurcharge.findFirst({
            where: { shippingCompanyId: txCarrier.id, name: s.name },
          })
          const data = {
            shippingCompanyId: txCarrier.id,
            name: s.name,
            description: s.description ?? null,
            amount: s.amount,
            currency: s.currency,
            applyType: s.applyType,
            containerTypes: s.containerTypes,
            isActive: true,
          }
          if (existing) {
            await tx.carrierSurcharge.update({ where: { id: existing.id }, data })
          } else {
            await tx.carrierSurcharge.create({ data })
          }
        }
      },
      { timeout: 120_000 },
    )

    console.log(`\n✓ APPLY tamamlandı (${count("CREATE")} create, ${count("UPDATE")} update)`)

    // 9. Apply sonrası doğrulama: her (liman × tip) için kural çözülüyor mu?
    //    (calculate-tariff.ts'in "tarife bulunamadı" sorgusunun aynısı)
    const txCarrier = await prisma.shippingCompany.findUnique({
      where: { code: pack.carrier.code },
    })
    const freshPorts = await prisma.port.findMany()
    const freshPortByCode = new Map(freshPorts.map((p) => [p.code, p]))
    const today = new Date()
    let smokeOk = 0
    const smokeFail: string[] = []
    for (const rule of flatRules) {
      const port = freshPortByCode.get(rule.portCode)!
      const found = await prisma.tariffRule.findFirst({
        where: {
          portId: port.id,
          shippingCompanyId: txCarrier!.id,
          containerType: rule.containerType,
          imoCargo: rule.imoCargo,
          isActive: true,
          effectiveFrom: { lte: today },
          OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: today } }],
        },
      })
      if (found) {
        smokeOk++
      } else {
        smokeFail.push(
          `${rule.portCode} × ${rule.containerType} (effectiveFrom ${rule.effectiveFrom} gelecekte olabilir)`,
        )
      }
    }
    console.log(`Smoke test: ${smokeOk}/${flatRules.length} kombinasyon bugünün tarihiyle çözülüyor`)
    for (const f of smokeFail.slice(0, 10)) console.log(`  ✗ ${f}`)
    if (toIsoDate(today) < pack.defaults.effectiveFrom) {
      console.log(
        `  ℹ effectiveFrom (${pack.defaults.effectiveFrom}) gelecek tarihli — kurallar o tarihe kadar hesaplamada görünmez`,
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
