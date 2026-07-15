/**
 * API Client — constructs absolute URLs for API calls.
 *
 * In development (`next dev`), relative URLs like `/api/…` work fine because
 * the dev server proxies both the frontend and the API routes.
 *
 * In static export mode (`output: "export"` → Capacitor / native mobile), the
 * static HTML/JS is served from a local webview and there is no Next.js server
 * behind it. All API calls must point to the live Vercel deployment.
 *
 * Set NEXT_PUBLIC_API_BASE_URL to the production URL (e.g.
 * https://www.ardiyesizgiris.com) in your Vercel environment and `.env` /
 * `.env.local` files so the static bundle knows where the API lives.
 */

const API_BASE_URL: string =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) || ""

/**
 * Resolve an API path to a full URL.
 *
 * When NEXT_PUBLIC_API_BASE_URL is set, the path is prefixed with it.
 * Otherwise the path is returned as-is (works for `next dev` relative fetches).
 *
 * @example
 * apiUrl("/api/calculate")  // → "https://www.ardiyesizgiris.com/api/calculate"
 * apiUrl("/api/ports")      // → "https://www.ardiyesizgiris.com/api/ports"
 */
export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`apiUrl: path must start with "/", got "${path}"`)
  }
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

/**
 * Typed fetch wrapper that automatically prefixes API paths with the
 * production base URL when NEXT_PUBLIC_API_BASE_URL is set (Capacitor /
 * static export mode). In `next dev`, paths are used as-is.
 *
 * Use this everywhere instead of raw `fetch("/api/…")` so API calls work
 * inside Capacitor's webview AND in the regular Next.js server.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(apiUrl(path), init)
}

/**
 * Returns the base URL for the API (without trailing slash).
 * Useful for configuring third-party libraries like NextAuth SessionProvider.
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL
}
