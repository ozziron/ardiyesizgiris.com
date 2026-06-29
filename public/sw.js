// Ardiyesiz Giriş — Service Worker
// Network-first strategy with cache fallback for core app shell.
const CACHE_NAME = "ardiyesizgiris-v1"
const APP_SHELL = ["/", "/hesaplama", "/fiyatlandirma", "/sozluk", "/limanlar"]

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Skip non-GET and non-http(s) requests
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for same-origin navigation & static assets
        const url = new URL(event.request.url)
        if (
          url.origin === self.location.origin &&
          !url.pathname.startsWith("/api/") &&
          !url.pathname.startsWith("/_next/")
        ) {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
