import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tüm işlemlerin %10'unu izle (production'da ayarlanabilir)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay — hata anında son oturumu tekrar izlemek için
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserApiErrorsIntegration(),
  ],

  // Hataları kullanıcıya göstermeden önce filtrele
  beforeSend(event, hint) {
    const error = hint.originalException

    // Geliştirme ortamında Next.js digest hatalarını filtrele
    if (process.env.NODE_ENV === "development") {
      return null
    }

    // Known Next.js internals — framework kaynaklı gereksiz hataları filtrele
    if (
      error instanceof Error &&
      (error.message.includes("Hydration") ||
        error.message.includes("Minified React error"))
    ) {
      return null
    }

    return event
  },
})
