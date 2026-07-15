/**
 * Next.js Instrumentation Hook — Sentry SDK registration.
 *
 * Next.js 15+ calls `register()` once during server bootstrap.
 * We load the correct Sentry config per runtime (Node.js / Edge).
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}
