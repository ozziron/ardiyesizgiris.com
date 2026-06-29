import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export for Capacitor native mobile wrapper.
  // API routes run on the live Vercel domain; the Capacitor webview
  // calls them via NEXT_PUBLIC_API_BASE_URL (see lib/api-client.ts).
  output: "export",

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },

  // Production source maps — Sentry'nin stack trace'leri çözümleyebilmesi için
  productionBrowserSourceMaps: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            // Next.js dev mode (HMR / react-refresh) needs 'unsafe-eval'.
            // In production we keep the strict policy without it.
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws: https: https://*.sentry.io; base-uri 'self'; frame-ancestors 'none'"
                : "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: https://*.sentry.io; base-uri 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ]
  },
}

// Sentry build-time configuration
const sentryBuildOptions = {
  // Source map upload auto-detects org/project from env:
  //   SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN
  // Yalnızca production build'de ve env vars set edildiğinde çalışır.

  // Genişletilmiş dosya yükleme — Next.js internal + dependency source maps dahil
  widenClientFileUpload: true,

  // Vercel Cron Jobs için otomatik Sentry Cron Monitörleri
  automaticVercelMonitors: true,

  // Source maps'i upload sonrası silme (disk temizliği)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Hata durumunda build'i durdurma, sadece uyarı ver
  errorHandler: (err) => {
    console.warn("[Sentry] Build-time warning:", err.message)
  },

  // Static export modunda server instrumentation gerekmez,
  // sadece client bundle'ı instrument edilir.
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
}

export default withSentryConfig(nextConfig, sentryBuildOptions)
