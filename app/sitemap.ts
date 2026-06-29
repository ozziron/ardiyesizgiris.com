import type { MetadataRoute } from "next"
import { glossaryTerms } from "@/lib/content/glossary"
import { portLandingData } from "@/lib/content/ports"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ardiyesizgiris.com"

  // Statik ana sayfalar
  const staticRoutes = [
    { route: "", priority: 1, changeFrequency: "weekly" as const },
    { route: "/hesaplama", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/iletisim", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/giris", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/hakkimizda", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/sozluk", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/limanlar", priority: 0.9, changeFrequency: "weekly" as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // Sözlük terimleri — her terim sayfası
  const glossaryRoutes = glossaryTerms.map((term) => ({
    url: `${baseUrl}/sozluk/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Liman açılış sayfaları — her liman
  const portRoutes = portLandingData.map((port) => ({
    url: `${baseUrl}/limanlar/${port.code}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...glossaryRoutes, ...portRoutes]
}
