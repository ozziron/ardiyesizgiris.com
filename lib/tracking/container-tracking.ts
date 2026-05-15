import { z } from "zod"

export const containerTrackingRequestSchema = z.object({
  containerId: z
    .string()
    .trim()
    .min(4, "Konteyner numarası girin")
    .max(20, "Konteyner numarası çok uzun")
    .regex(/^[A-Z0-9-]+$/i, "Sadece harf, rakam ve tire kullanın")
    .transform((value) => value.toUpperCase()),
  carrierCode: z
    .string()
    .trim()
    .max(20, "Hat kodu çok uzun")
    .optional()
    .nullable()
    .transform((value) => (value ? value.toUpperCase() : null)),
})

export type ContainerTrackingEvent = {
  status: string
  location?: string | null
  eventTime?: string | null
  vesselName?: string | null
  voyage?: string | null
}

export type ContainerTrackingResult = {
  containerId: string
  carrierCode?: string | null
  status: string
  location?: string | null
  eta?: string | null
  lastUpdatedAt: string
  events: ContainerTrackingEvent[]
  source: string
}

type ProviderResponse = {
  containerId?: string
  container_id?: string
  carrierCode?: string | null
  carrier_code?: string | null
  status?: string
  location?: string | null
  eta?: string | null
  lastUpdatedAt?: string
  last_updated_at?: string
  events?: Array<{
    status?: string
    description?: string
    location?: string | null
    eventTime?: string | null
    event_time?: string | null
    vesselName?: string | null
    vessel_name?: string | null
    voyage?: string | null
  }>
}

export function getTrackingConfig() {
  return {
    apiUrl: process.env.CONTAINER_TRACKING_API_URL || "",
    apiKey: process.env.CONTAINER_TRACKING_API_KEY || "",
    sourceName: process.env.CONTAINER_TRACKING_SOURCE || "external-provider",
  }
}

export async function fetchContainerTracking(input: {
  containerId: string
  carrierCode?: string | null
}): Promise<ContainerTrackingResult> {
  const config = getTrackingConfig()

  if (!config.apiUrl) {
    throw new Error("Container tracking sağlayıcısı tanımlı değil. CONTAINER_TRACKING_API_URL girilmeli.")
  }

  const url = new URL(config.apiUrl)
  url.searchParams.set("containerId", input.containerId)
  if (input.carrierCode) {
    url.searchParams.set("carrierCode", input.carrierCode)
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    cache: "no-store",
  })

  const data = (await response.json()) as ProviderResponse

  if (!response.ok) {
    throw new Error(data?.status || "Container tracking sağlayıcısından veri alınamadı.")
  }

  return normalizeProviderResponse(data, input, config.sourceName)
}

function normalizeProviderResponse(
  data: ProviderResponse,
  fallback: { containerId: string; carrierCode?: string | null },
  source: string,
): ContainerTrackingResult {
  const events = (data.events || []).map((event) => ({
    status: event.status || event.description || "Durum güncellendi",
    location: event.location ?? null,
    eventTime: event.eventTime || event.event_time || null,
    vesselName: event.vesselName || event.vessel_name || null,
    voyage: event.voyage || null,
  }))

  return {
    containerId: data.containerId || data.container_id || fallback.containerId,
    carrierCode: data.carrierCode || data.carrier_code || fallback.carrierCode || null,
    status: data.status || events[0]?.status || "Durum alındı",
    location: data.location ?? events[0]?.location ?? null,
    eta: data.eta ?? null,
    lastUpdatedAt: data.lastUpdatedAt || data.last_updated_at || new Date().toISOString(),
    events,
    source,
  }
}
