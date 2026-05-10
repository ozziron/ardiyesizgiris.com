"use client"

import { CheckCircle2, Ship } from "lucide-react"

interface CalculationTimelineProps {
  departureDate: Date | string
  freeUntilDate: Date | string
  freeDays: number
}

const toDate = (v: Date | string | null | undefined) =>
  !v ? null : v instanceof Date ? v : new Date(v)

const formatTR = (d: Date | null) =>
  !d ? "-" : d.toLocaleDateString("tr-TR")

/**
 * Visual timeline of a calculation, mirroring the hero illustration on
 * the homepage so the marketing promise and the actual product look
 * identical. Always rendered as a two-marker bar: gemi kalkış on the
 * left as the user-supplied input, ardiyesiz giriş on the right as the
 * computed answer (pulsing).
 *
 * Charge-specific information (gate-in, ücretli days, total cost) lives
 * in a separate breakdown card next to this timeline so the visual stays
 * focused on the single most important question — "ne zaman ardiyesiz
 * girebilirim?".
 */
export function CalculationTimeline({
  departureDate,
  freeUntilDate,
  freeDays,
}: CalculationTimelineProps) {
  const dep = toDate(departureDate)
  const free = toDate(freeUntilDate)

  return (
    <div className="space-y-3">
      {/* Top label row */}
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Ship className="h-3 w-3" />
          Gemi Kalkış
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600">
          Ardiyesiz Giriş
          <CheckCircle2 className="h-3 w-3" />
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        {/* Emerald muafiyet zone — covers the right ~70% */}
        <div className="absolute inset-y-0 left-[28%] right-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />

        {/* Departure marker */}
        <div className="absolute -top-1 left-[28%] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-gray-700 shadow dark:border-gray-900" />

        {/* Free-entry marker — pulsing ring + filled emerald dot */}
        <span className="absolute -top-1 right-0 flex h-4 w-4 translate-x-1/2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow dark:border-gray-900" />
        </span>
      </div>

      {/* Date label row */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono tabular-nums text-muted-foreground">{formatTR(dep)}</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {freeDays} gün muafiyet
        </span>
        <span className="font-mono font-semibold tabular-nums text-emerald-600">
          {formatTR(free)}
        </span>
      </div>
    </div>
  )
}
