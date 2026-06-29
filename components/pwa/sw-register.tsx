"use client"

import { useEffect } from "react"

/**
 * Registers the service worker at /sw.js in production.
 * Must be a client component rendered in the root layout.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return
    }

    // Only register in production to avoid HMR interference
    if (process.env.NODE_ENV !== "production") return

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "[SW] Registered — scope:",
          registration.scope
        )
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err)
      })
  }, [])

  return null
}
