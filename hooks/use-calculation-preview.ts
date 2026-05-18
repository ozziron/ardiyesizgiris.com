"use client";

import { useEffect, useState } from "react";

export type LivePreview = {
  freeDays: number;
  freeUntilDate: string;
};

type PreviewInput = {
  portId: string;
  shippingCompanyId: string;
  containerType: string;
  departureDate: string;
};

/**
 * Debounced free-time preview fetch. Returns null until all four
 * inputs are filled; thereafter returns the latest /api/free-time-preview
 * response. Aborts in-flight requests when inputs change.
 */
export function useCalculationPreview(input: PreviewInput): LivePreview | null {
  const { portId, shippingCompanyId, containerType, departureDate } = input;
  const [preview, setPreview] = useState<LivePreview | null>(null);

  useEffect(() => {
    if (!portId || !shippingCompanyId || !containerType || !departureDate) {
      setPreview(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          portId,
          shippingCompanyId,
          containerType,
          departureDate,
        });
        const res = await fetch(`/api/free-time-preview?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setPreview(null);
          return;
        }
        const data = await res.json();
        setPreview({ freeDays: data.freeDays, freeUntilDate: data.freeUntilDate });
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setPreview(null);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [portId, shippingCompanyId, containerType, departureDate]);

  return preview;
}
