import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  /**
   * Show the small "approved" emerald checkmark badge at the top-right of
   * the container. Hide for very tight contexts like footer monograms.
   */
  badge?: boolean
}

/**
 * Brand logomark — a stylised shipping container with corrugation ridges
 * and a small emerald check badge that hints at the "ardiyesiz / free
 * entry" value proposition. Designed to remain readable at favicon
 * sizes (16×16) while scaling to header sizes (32–40px).
 *
 * Inherits color from the parent (`currentColor`) so it adapts to the
 * surrounding text color (e.g. white on the emerald header band, dark
 * gray in the footer). The badge always uses brand emerald.
 */
export function Logo({ className, badge = true }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8 text-emerald-600", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Container body */}
      <rect x="3" y="9" width="22" height="14" rx="2.5" fill="currentColor" />

      {/* Corrugation ridges — give the silhouette a recognisable
          shipping-container texture without adding much complexity. */}
      <line
        x1="8"
        y1="12.5"
        x2="8"
        y2="19.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1="12"
        y1="12.5"
        x2="12"
        y2="19.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1="16"
        y1="12.5"
        x2="16"
        y2="19.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1="20"
        y1="12.5"
        x2="20"
        y2="19.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />

      {badge && (
        <>
          {/* Approved/free checkmark badge — bottom-right corner.
              Brighter emerald, white check inside. The 1px white halo
              keeps it legible when the badge overlaps a busy background. */}
          <circle cx="25" cy="22" r="5.5" fill="white" />
          <circle cx="25" cy="22" r="4.5" fill="#10b981" />
          <path
            d="M22.8 22 L24.2 23.4 L27.2 20.4"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </svg>
  )
}
