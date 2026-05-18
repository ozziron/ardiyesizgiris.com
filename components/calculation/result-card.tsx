"use client"

import { ArrowRight, FileText } from "lucide-react"
import type { ChargeBreakdownItem, CarrierSurchargeItem } from "@/types/calculation"
import { formatTR, formatMoney } from "@/lib/format"
import { CalculationTimeline } from "./timeline"
import { CostBreakdownChart } from "./cost-chart"

export interface SummaryRow {
  label: string
  value: string
  mono?: boolean
}

interface SharedProps {
  summary: SummaryRow[]
  freeDays: number
  freeUntilDate: Date | string
  departureDate: Date | string
  warning?: string
  surcharges?: CarrierSurchargeItem[]
  /** Action panel (PDF / email) rendered at the bottom of the card. */
  children?: React.ReactNode
}

export interface PlanningResultCardProps extends SharedProps {}

export interface CostResultCardProps extends SharedProps {
  totalCharge: number
  chargeableDays: number
  totalDaysAtPort: number
  chargeBreakdown?: ChargeBreakdownItem[]
  /** ISO-4217 currency code from the tariff. Defaults to TRY for back-compat. */
  currency?: string
}

/**
 * Big report card matching the homepage hero illustration aesthetic:
 *
 *   ┌──────────────────────────────────┐
 *   │ ● ● ●          ardiyesizgiris.com │  window chrome
 *   │ ┌────────────────────────────┐   │
 *   │ │ Liman / Hat / Konteyner... │   │  summary panel
 *   │ └────────────────────────────┘   │
 *   │  ⛴ Gemi Kalkış    Ardiyesiz ✓    │  timeline
 *   │  [hero strip + extras (variant)] │
 *   │  [warning] [actions slot]        │
 *   └──────────────────────────────────┘
 */
function ResultCardShell({
  summary,
  departureDate,
  freeUntilDate,
  freeDays,
  warning,
  children,
  hero,
  extras,
}: SharedProps & {
  hero: React.ReactNode
  extras?: React.ReactNode
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-6 top-10 h-72 rounded-3xl bg-emerald-400/20 blur-3xl dark:bg-emerald-500/15" />

      <div className="relative rounded-2xl border border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-500/10 dark:border-emerald-900/40 dark:bg-gray-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
            ardiyesizgiris.com
          </span>
        </div>

        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:p-4">
          {summary.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground sm:text-sm">{row.label}</span>
              <span
                className={`text-xs font-medium sm:text-sm ${row.mono ? "font-mono tabular-nums" : ""}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 sm:mt-6">
          <CalculationTimeline
            departureDate={departureDate}
            freeUntilDate={freeUntilDate}
            freeDays={freeDays}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">{hero}</div>

        {extras}

        {warning && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="mt-0.5 font-bold leading-none">!</span>
            <p className="leading-relaxed">{warning}</p>
          </div>
        )}

        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  )
}

function DateHero({ freeUntilDate }: { freeUntilDate: Date | string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/40 sm:px-5 sm:py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        Ardiyesiz Giriş Başlangıcı
      </p>
      <div className="mt-0.5 flex items-end justify-between gap-3">
        <p className="font-display text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300 sm:text-3xl">
          {formatTR(freeUntilDate)}
        </p>
        <ArrowRight className="mb-1 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
      </div>
    </div>
  )
}

export function PlanningResultCard(props: PlanningResultCardProps) {
  const { freeDays, freeUntilDate, surcharges } = props
  return (
    <ResultCardShell
      {...props}
      hero={
        <>
          <DateHero freeUntilDate={freeUntilDate} />
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60 sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Muafiyet Süresi
            </p>
            <p className="mt-0.5 font-display text-2xl font-bold tabular-nums sm:text-3xl">
              {freeDays} <span className="text-base font-medium text-muted-foreground">gün</span>
            </p>
          </div>
        </>
      }
      extras={
        surcharges && surcharges.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Hat Ek Ücretleri (Bu konteyner tipine uygulanır)
            </p>
            {surcharges.map((s, idx) => (
              <div key={idx} className="mt-1.5">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-medium">{s.name}:</span>{" "}
                  {formatMoney(s.amount, s.currency)}
                </p>
                {s.description ? (
                  <p className="mt-0.5 text-xs italic leading-relaxed text-amber-700/80 dark:text-amber-300/70">
                    {s.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : undefined
      }
    />
  )
}

export function CostResultCard(props: CostResultCardProps) {
  const {
    freeDays,
    freeUntilDate,
    totalCharge,
    chargeableDays,
    totalDaysAtPort,
    chargeBreakdown,
    currency = "TRY",
    surcharges,
  } = props
  const fmt = (n: number) => formatMoney(n, currency)
  const showBreakdown = totalCharge > 0 && chargeBreakdown && chargeBreakdown.length > 0
  const free = totalCharge === 0
  const showSurcharges = surcharges && surcharges.length > 0

  return (
    <ResultCardShell
      {...props}
      hero={
        <>
          <DateHero freeUntilDate={freeUntilDate} />
          <div
            className={`rounded-xl border px-4 py-3 sm:px-5 sm:py-4 ${
              free
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                free ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
              }`}
            >
              Toplam Masraf
            </p>
            <p
              className={`mt-0.5 font-display text-2xl font-bold tabular-nums sm:text-3xl ${
                free ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {free ? "Ücretsiz" : fmt(totalCharge)}
            </p>
          </div>
        </>
      }
      extras={
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Muafiyet" value={`${freeDays} gün`} />
            <Stat label="Liman Günü" value={`${totalDaysAtPort} gün`} />
            <Stat label="Ücretli Gün" value={`${chargeableDays} gün`} />
          </div>

          {showBreakdown && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold">Masraf Kırılımı</p>
                <span className="ml-auto h-px flex-1 bg-emerald-100 dark:bg-emerald-900/40" />
              </div>

              <CostBreakdownChart data={chargeBreakdown!} currency={currency} />

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Kademe</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Gün</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Birim</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chargeBreakdown!.map((row, idx) => (
                      <tr
                        key={`${row.tier}-${row.days}`}
                        className={
                          idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/40"
                        }
                      >
                        <td className="px-3 py-2 font-medium">Kademe {row.tier}</td>
                        <td className="px-3 py-2 tabular-nums">{row.days} gün</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{fmt(row.price_per_day)}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">{fmt(row.subtotal)}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 font-semibold dark:bg-emerald-950/40">
                      <td colSpan={3} className="px-3 py-2.5 uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Toplam Masraf
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-emerald-700 dark:text-emerald-300">
                        {fmt(totalCharge)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showSurcharges && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold">Hat Ek Ücretleri (Surcharge)</p>
                <span className="ml-auto h-px flex-1 bg-amber-100 dark:bg-amber-900/40" />
              </div>
              <div className="overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-600 text-white">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">Açıklama</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surcharges!.map((s, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/40"}
                      >
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium">{s.name}</div>
                          {s.description ? (
                            <div className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                              {s.description}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right align-top font-semibold tabular-nums">
                          {formatMoney(s.amount, s.currency)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50 font-semibold dark:bg-amber-950/40">
                      <td className="px-3 py-2.5 uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Surcharge Toplam
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-amber-700 dark:text-amber-300">
                        {formatMoney(
                          surcharges!.reduce((sum, s) => sum + s.amount, 0),
                          surcharges![0].currency
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      }
    />
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-base font-bold tabular-nums">{value}</p>
    </div>
  )
}
