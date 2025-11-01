import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ardiyesizgiris.com"

  // Ana sayfalar (mevcut rotalar listelendi)
  const routes = ["", "/hesaplama", "/iletisim", "/giris"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }))

  return routes
}
