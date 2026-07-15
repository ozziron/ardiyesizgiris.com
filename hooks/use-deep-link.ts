"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

/**
 * Capacitor deep-link handling hook.
 *
 * When the app is opened via a Universal Link (iOS) or App Link (Android),
 * Capacitor fires the `appUrlOpen` event with the full HTTPS URL. This hook
 * extracts the pathname + query from that URL and navigates the Next.js
 * router to the matching route inside the app shell.
 *
 * Without the @capacitor/app plugin installed the hook is a no-op —
 * the dynamic import swallows the missing module gracefully so the
 * web app (non-Capacitor) path is unaffected.
 *
 * Usage (in a client component):
 *   useDeepLink()
 */
export function useDeepLink() {
  const router = useRouter()
  const registered = useRef(false)

  useEffect(() => {
    // Only register once per component lifecycle.
    if (registered.current) return
    registered.current = true

    let cancelled = false

    const register = async () => {
      try {
        // Dynamic import — tree-shakes away for non-Capacitor builds
        // and avoids a hard crash if the plugin isn't installed.
        const { App } = await import("@capacitor/app")

        if (cancelled) return

        // Listen for URLs opened while the app is already running.
        App.addListener("appUrlOpen", (event) => {
          if (cancelled) return
          try {
            const url = new URL(event.url)
            // Extract path + query/hash, drop the origin.
            const target = url.pathname + url.search + url.hash
            if (target && target !== "/") {
              router.push(target)
            }
          } catch {
            // Malformed URL — silently ignore.
          }
        })

        // Also check the launch URL (cold-start deep link).
        const launchUrl = await App.getLaunchUrl()
        if (!cancelled && launchUrl?.url) {
          try {
            const url = new URL(launchUrl.url)
            const target = url.pathname + url.search + url.hash
            if (target && target !== "/") {
              router.push(target)
            }
          } catch {
            // Malformed launch URL — silently ignore.
          }
        }
      } catch {
        // @capacitor/app not available — running in browser, not Capacitor.
        // This is the expected path for the web-only app.
      }
    }

    register()

    return () => {
      cancelled = true
    }
  }, [router])
}
