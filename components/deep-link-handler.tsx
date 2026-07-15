"use client"

import { useDeepLink } from "@/hooks/use-deep-link"

/**
 * DeepLinkHandler — mounts the Capacitor appUrlOpen listener.
 *
 * Renders nothing visually. Place this inside a client component boundary
 * near the root of the app (e.g. alongside AuthSessionProvider in layout).
 *
 * ARDA-45: Deep link + .well-known/ dosyaları
 */
export function DeepLinkHandler() {
  useDeepLink()
  return null
}
