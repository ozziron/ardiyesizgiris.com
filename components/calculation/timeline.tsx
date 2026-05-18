"use client"

import { CheckCircle2, Ship } from "lucide-react"
import { formatTR } from "@/lib/format"

interface CalculationTimelineProps {
  departureDate: Date | string
  freeUntilDate: Date | string
  freeDays: number
}

const toDate = (v: Date | string | null | undefined) =>
  !v ? null : v instanceof Date ? v : new Date(v)

/**
 * Visual timeline of a calculation, mirroring the hero illustration on
 * the homepage so the marketing promise and the actual product look
 * identical. Chronological left-to-right: the earlier date (ardiyesiz
 * giriş başlangıcı) sits on the LEFT with a pulsing emerald dot (the
 * "answer" the user came here for); the later date (gemi kalkış) sits
 * on the RIGHT as a solid grey marker (the user-supplied input).
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
      {/* Top label row — chronological order: free entry (earlier) on
          the LEFT, departure (later) on the RIGHT */}
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5 text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          Ardiyesiz Giriş
        </span>
        <span className="flex items-center gap-1.5">
          Gemi Kalkış
          <Ship className="h-3 w-3" />
        </span>
      </div>

      {/* Track — the entire bar IS the muafiyet zone (free_until →
          departure), so we fill the whole width with the emerald gradient. */}
      <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />

        {/* Free-entry marker (LEFT, pulsing — this is the "answer" the user
            came here for, so it gets the attention-grabbing pulse). */}
        <span className="absolute -top-1 left-0 flex h-4 w-4 -translate-x-1/2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow dark:border-gray-900" />
        </span>

        {/* Departure marker (RIGHT, solid — it's the user-supplied input,
            shown for reference but doesn't need to draw attention). */}
        <div className="absolute -top-1 right-0 h-4 w-4 translate-x-1/2 rounded-full border-2 border-white bg-gray-700 shadow dark:border-gray-900" />
      </div>

      {/* Date label row — matches the markers above, same left/right order */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-semibold tabular-nums text-emerald-600">
          {formatTR(free)}
        </span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {freeDays} gün muafiyet
        </span>
        <span className="font-mono tabular-nums text-muted-foreground">{formatTR(dep)}</span>
      </div>
    </div>
  )
}
