"use client"

import { Anchor, ArrowRight, CheckCircle2, Ship } from "lucide-react"

/**
 * Hero illustration for the public homepage.
 *
 * Replaces the previous "three floating colored boxes labelled
 * 'Konteyner'" decoration with a product-flavoured mockup that mirrors
 * the actual calculation flow: a small form summary card on top, an
 * emerald-highlighted timeline below it (gemi kalkış → muafiyet zone
 * → ardiyesiz giriş başlangıcı), plus a result chip pinned to the
 * timeline marker.
 *
 * Animations are subtle — a gentle floating motion on the card and a
 * pulsing dot on the result marker. No JS animation libraries; everything
 * is CSS keyframes already declared in tailwind.config.ts (animate-float)
 * plus inline pulse.
 */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[520px]">
      {/* Soft emerald glow behind the card to lift it from the gradient bg */}
      <div className="absolute inset-x-6 top-10 h-72 rounded-3xl bg-emerald-400/30 blur-3xl dark:bg-emerald-500/20" />

      {/* Mockup product card */}
      <div className="animate-float relative rounded-2xl border border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-500/10 dark:border-emerald-900/40 dark:bg-gray-900">
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

        {/* Form-like summary rows */}
        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
          <FormRow label="Liman" value="Marport İstanbul" />
          <FormRow label="Hat" value="Maersk Line" />
          <FormRow label="Konteyner" value="40HC" />
          <FormRow label="Kalkış" value="01.05.2026" mono />
        </div>

        {/* Timeline — chronological left-to-right (free_until on the LEFT,
            departure on the RIGHT), matching the live CalculationTimeline
            so marketing and product feel identical. */}
        <div className="mt-5 space-y-3">
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

          {/* Full-width emerald muafiyet zone */}
          <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />

            {/* LEFT marker — pulsing answer (free entry date) */}
            <span className="absolute -top-1 left-0 flex h-4 w-4 -translate-x-1/2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow dark:border-gray-900" />
            </span>

            {/* RIGHT marker — departure date, the supplied input */}
            <div className="absolute -top-1 right-0 h-4 w-4 translate-x-1/2 rounded-full border-2 border-white bg-gray-700 shadow dark:border-gray-900" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold tabular-nums text-emerald-600">25.04.2026</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              7 gün muafiyet
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">01.05.2026</span>
          </div>
        </div>

        {/* Result strip — the "headline" answer */}
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Ardiyesiz Giriş Başlangıcı
          </p>
          <div className="mt-0.5 flex items-end justify-between gap-3">
            <p className="font-display text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              25.04.2026
            </p>
            <ArrowRight className="mb-1 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Floating accent badge — emerald check, sits on the card's edge */}
      <div className="absolute -right-3 top-12 hidden rotate-6 rounded-2xl border border-emerald-200 bg-white p-3 shadow-lg dark:border-emerald-800 dark:bg-gray-900 sm:block">
        <Anchor className="h-6 w-6 text-emerald-600" />
      </div>
    </div>
  )
}

function FormRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-medium ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
