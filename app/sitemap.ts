import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ardiyesizgiris.com"

  // Ana sayfalar
  const routes = ["", "/hesaplama", "/limanlar", "/blog", "/iletisim", "/giris", "/kayit", "/sss"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }))

  // Liman sayfaları
  const limanlar = ["istanbul", "izmir", "mersin", "iskenderun", "samsun", "antalya"].map((liman) => ({
    url: `${baseUrl}/limanlar/${liman}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...routes, ...limanlar]
}
