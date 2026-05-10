import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

interface WordmarkProps {
  className?: string
  /** When true, wraps the wordmark in a Link to `/`. Default: true. */
  asLink?: boolean
  /** Override the logo size; default 32px. */
  logoClassName?: string
}

/**
 * Brand wordmark — pairs the Logo glyph with the textual brand name.
 * Used in the public header, footer, and admin sidebar.
 *
 * Typography note: brand name uses font-display (Inter Tight) with
 * tightened letter-spacing for a more confident, B2B-feeling look.
 * The two-word structure gets a subtle break — "Ardiyesiz" in body
 * weight, "Giriş" in emerald to anchor brand color recognition.
 */
export function Wordmark({
  className,
  asLink = true,
  logoClassName,
}: WordmarkProps) {
  const inner = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo className={cn("h-8 w-8 shrink-0 text-emerald-600", logoClassName)} />
      <span className="font-display text-lg font-bold tracking-tight leading-none">
        Ardiyesiz <span className="text-emerald-600">Giriş</span>
      </span>
    </span>
  )

  if (asLink) {
    return (
      <Link
        href="/"
        className="group inline-flex items-center transition-opacity hover:opacity-90"
        aria-label="Ardiyesiz Giriş — anasayfa"
      >
        {inner}
      </Link>
    )
  }

  return inner
}
