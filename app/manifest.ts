import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ardiyesiz Giriş — Konteyner Ardiye Hesaplama",
    short_name: "Ardiyesiz Giriş",
    description:
      "Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli ardiyesiz gün hesaplama aracı.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#ffffff",
    theme_color: "#10b981",
    orientation: "any",
    categories: ["business", "productivity"],
    lang: "tr",
    dir: "ltr",
    id: "com.ardiyesizgiris.web",
    icons: [
      // SVG primary — crisp at any resolution
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      // PNG fallbacks — universal compatibility
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      // Apple touch icon
      {
        src: "/icons/icon-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      // App Store listing icon (1024×1024 — also used by Google Play)
      {
        src: "/icons/icon-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Hesaplama",
        short_name: "Hesapla",
        description: "Ardiyesiz giriş hesaplama aracını aç",
        url: "/hesaplama",
      },
    ],
  }
}
