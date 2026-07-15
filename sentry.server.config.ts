import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Sunucu tarafı profiling (Node 18+)
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Sunucu hatalarını filtrele
  beforeSend(event, hint) {
    // Geliştirme ortamında event gönderme
    if (process.env.NODE_ENV === "development") {
      return null
    }
    return event
  },
})
