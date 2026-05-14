"use client"

import { useEffect, useState } from "react"

export interface ContainerTypeOption {
  id: string
  code: string
  label: string
  displayOrder: number
}

/**
 * Shared client-side hook that fetches the list of currently-active
 * container types from /api/container-types. Used by the calculation
 * form, free-time rule forms (single + bulk), and tariff rule form so
 * a single soft-delete or label edit in admin propagates everywhere.
 *
 * Returns `loading=true` until the first fetch completes; consumers can
 * disable submit buttons or show a spinner during this window. Network
 * failures resolve to an empty list (never throws) — the form just
 * shows no options rather than crashing.
 */
export function useContainerTypes() {
  const [options, setOptions] = useState<ContainerTypeOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/container-types")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setOptions(data.data || [])
      })
      .catch(() => {
        if (cancelled) return
        setOptions([])
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { options, loading }
}

/**
 * Resolve a container-type code to its display label. Falls back to the
 * code itself if not found in the list (e.g. a legacy free-time rule for
 * a type the admin has since hard-deleted).
 */
export function resolveContainerTypeLabel(
  code: string,
  options: ContainerTypeOption[]
): string {
  return options.find((o) => o.code === code)?.label ?? code
}
