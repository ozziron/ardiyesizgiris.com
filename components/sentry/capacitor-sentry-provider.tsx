"use client"

import { useEffect } from "react"

/**
 * Sentry Capacitor Provider — initializes the Sentry Capacitor SDK when the
 * app is running inside a native Capacitor WebView (Android / iOS).
 *
 * In the browser / standalone PWA, Sentry is already initialized by
 * `@sentry/nextjs` via `sentry.client.config.ts`. The Capacitor SDK wraps
 * the browser SDK and adds native app context: device info, app lifecycle
 * breadcrumbs, and release health.
 *
 * The Capacitor SDK already bundles the default browser integrations:
 * `browserApiErrors`, `breadcrumbs`, `globalHandlers`, `linkedErrors`,
 * `dedupe`, and HTTP context. Native-side integrations (device context,
 * log enricher, native crash handling) are activated by `enableNative`.
 *
 * This component is a no-op when Capacitor is not available (e.g. ordinary
 * browser visits).
 *
 * ## Vercel Analytics — native wrapper co-existence
 *
 * Vercel Web Analytics (`<Analytics />`) and Speed Insights (`<SpeedInsights />`)
 * are rendered in `app/layout.tsx` unconditionally. Inside the Capacitor/TWA
 * WebView they load from the live Vercel deployment (same origin), so they
 * work without changes. The CSP allows `script-src 'self' https:` and
 * `connect-src 'self' https:`, which covers the analytics endpoints
 * (`/_vercel/insights/*` → Vercel proxy → `va.vercel-scripts.com`).
 *
 * QA verification (device testing):
 *  1. Launch the native app on Android (TWA / Play Store) or iOS (Capacitor).
 *  2. Open browser DevTools connected to the WebView.
 *  3. Confirm the Network tab shows requests to `/_vercel/insights/script.js`
 *     and `/_vercel/insights` (or `/vitals`).
 *  4. Confirm the Vercel dashboard shows native-app page views.
 */
export function CapacitorSentryProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false

    async function initCapacitorSentry() {
      try {
        const { Capacitor } = await import("@capacitor/core")

        if (!Capacitor.isNativePlatform()) {
          // Running in a regular browser — @sentry/nextjs already handles this.
          return
        }

        const Sentry = await import("@sentry/capacitor")

        Sentry.init({
          // DSN is injected at build time; pick the public one for the client bundle.
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

          // Trace sampling — match the Next.js client config rate.
          tracesSampleRate:
            process.env.NODE_ENV === "production" ? 0.1 : 1.0,

          // Enable native breadcrumbs (app state changes, memory warnings, etc.)
          // and native crash handling (JS breadcrumbs attached to native crashes
          // on next app launch).
          enableNative: true,
          enableNativeCrashHandling: true,

          // Track sessions for Sentry Health / Release Health.
          enableAutoSessionTracking: true,

          // Filter noise in development.
          beforeSend(event) {
            if (process.env.NODE_ENV === "development") {
              return null
            }
            return event
          },
        })

        if (!cancelled) {
          console.log("[Sentry] Capacitor SDK initialized (native platform)")
        }
      } catch {
        // @capacitor/core or @sentry/capacitor not available — likely a plain
        // browser visit where neither package is bundled.
      }
    }

    initCapacitorSentry()

    return () => {
      cancelled = true
    }
  }, [])

  return children ? <>{children}</> : null
}
