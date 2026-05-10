"use client"

import { ArrowRight, FileText } from "lucide-react"
import { CalculationTimeline } from "./timeline"

interface SummaryRow {
  label: string
  value: string
  mono?: boolean
}

interface ChargeBreakdownItem {
  tier: number
  days: number
  price_per_day: number
  subtotal: number
}

interface CalculationResultCardProps {
  mode: "planning" | "cost"
  summary: SummaryRow[]
  freeDays: number
  freeUntilDate: Date | string
  departureDate: Date | string
  /** Cost mode only — the headline number alongside the date. */
  totalCharge?: number
  chargeableDays?: number
  totalDaysAtPort?: number
  chargeBreakdown?: ChargeBreakdownItem[]
  warning?: string
  /** Action panel (PDF / email) rendered at the bottom of the card. */
  children?: React.ReactNode
}

const formatTR = (d: Date | string) => {
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString("tr-TR")
}

const formatTL = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺"

/**
 * Big report card matching the homepage hero illustration aesthetic:
 *
 *   ┌──────────────────────────────────┐
 *   │ ● ● ●          ardiyesizgiris.com │  window chrome
 *   │ ┌────────────────────────────┐   │
 *   │ │ Liman / Hat / Konteyner... │   │  summary panel
 *   │ └────────────────────────────┘   │
 *   │                                  │
 *   │  ⛴ Gemi Kalkış    Ardiyesiz ✓    │  timeline
 *   │  ●━━━━━━━━━━━━━━●                │
 *   │                                  │
 *   │  ┌──────────────────────────┐    │
 *   │  │ ARDIYESIZ GIRIŞ          │    │  hero result
 *   │  │ 25.04.2026          →    │    │
 *   │  └──────────────────────────┘    │
 *   │                                  │
 *   │  [stats / breakdown / actions]   │
 *   └──────────────────────────────────┘
 */
export function CalculationResultCard({
  mode,
  summary,
  freeDays,
  freeUntilDate,
  departureDate,
  totalCharge = 0,
  chargeableDays = 0,
  totalDaysAtPort = 0,
  chargeBreakdown,
  warning,
  children,
}: CalculationResultCardProps) {
  const showCostHero = mode === "cost"
  const showCostBreakdown =
    mode === "cost" && totalCharge > 0 && chargeBreakdown && chargeBreakdown.length > 0

  return (
    <div className="relative">
      {/* Soft emerald glow behind the card */}
      <div className="pointer-events-none absolute inset-x-6 top-10 h-72 rounded-3xl bg-emerald-400/20 blur-3xl dark:bg-emerald-500/15" />

      <div className="relative rounded-2xl border border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-500/10 dark:border-emerald-900/40 dark:bg-gray-900 sm:p-6">
        {/* Window chrome */}
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

        {/* Summary panel — echoes inputs back to the user */}
        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:p-4">
          {summary.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground sm:text-sm">{row.label}</span>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  row.mono ? "font-mono tabular-nums" : ""
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-5 sm:mt-6">
          <CalculationTimeline
            departureDate={departureDate}
            freeUntilDate={freeUntilDate}
            freeDays={freeDays}
          />
        </div>

        {/* Hero result strip */}
        <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
          {/* Date headline */}
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

          {/* Cost mode: total charge headline alongside */}
          {showCostHero && (
            <div
              className={`rounded-xl border px-4 py-3 sm:px-5 sm:py-4 ${
                totalCharge === 0
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                  : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  totalCharge === 0
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                Toplam Masraf
              </p>
              <p
                className={`mt-0.5 font-display text-2xl font-bold tabular-nums sm:text-3xl ${
                  totalCharge === 0
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {totalCharge === 0 ? "Ücretsiz" : formatTL(totalCharge)}
              </p>
            </div>
          )}

          {/* Planning mode: muafiyet süresi as secondary stat */}
          {!showCostHero && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60 sm:px-5 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Muafiyet Süresi
              </p>
              <p className="mt-0.5 font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {freeDays} <span className="text-base font-medium text-muted-foreground">gün</span>
              </p>
            </div>
          )}
        </div>

        {/* Cost-only stats row */}
        {showCostHero && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Muafiyet" value={`${freeDays} gün`} />
            <Stat label="Liman Günü" value={`${totalDaysAtPort} gün`} />
            <Stat label="Ücretli Gün" value={`${chargeableDays} gün`} />
          </div>
        )}

        {/* Warning */}
        {warning && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="mt-0.5 font-bold leading-none">!</span>
            <p className="leading-relaxed">{warning}</p>
          </div>
        )}

        {/* Cost breakdown table */}
        {showCostBreakdown && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold">Masraf Kırılımı</p>
              <span className="ml-auto h-px flex-1 bg-emerald-100 dark:bg-emerald-900/40" />
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      Kademe
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      Gün
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      Birim
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chargeBreakdown!.map((row, idx) => (
                    <tr
                      key={`${row.tier}-${row.days}`}
                      className={
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50/50 dark:bg-gray-800/40"
                      }
                    >
                      <td className="px-3 py-2 font-medium">Kademe {row.tier}</td>
                      <td className="px-3 py-2 tabular-nums">{row.days} gün</td>
                      <td className="px-3 py-2 font-mono tabular-nums">
                        {formatTL(row.price_per_day)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {formatTL(row.subtotal)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 font-semibold dark:bg-emerald-950/40">
                    <td colSpan={3} className="px-3 py-2.5 uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Toplam Masraf
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-emerald-700 dark:text-emerald-300">
                      {formatTL(totalCharge)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action panel slot (PDF/email) */}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-display text-base font-bold tabular-nums">{value}</p>
    </div>
  )
}
