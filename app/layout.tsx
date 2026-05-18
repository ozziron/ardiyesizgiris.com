import type React from "react"
import "./globals.css"
import { Inter, Inter_Tight } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthSessionProvider } from "@/components/auth/session-provider"
import { AppShell } from "@/components/layout/app-shell"
import { ScrollLockGuard } from "@/components/scroll-lock-guard"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"

// Body text — Inter Latin Extended subset includes Turkish diacritics.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
})

// Display / heading typeface — tighter letter-spacing variant of Inter,
// used for h1/h2 and the brand wordmark to convey confidence.
const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700"],
})

export const metadata = {
  metadataBase: new URL("https://www.ardiyesizgiris.com"),
  title:
    "Ardiyesiz Giriş Hesaplama | Tüm Limanlarda Ardiyesiz Gününü Anında Öğrenin",
  description:
    "Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli ardiyesiz gün hesaplama aracı.",
  keywords:
    "ardiyesiz giriş, konteyner, liman, lojistik, ardiye hesaplama, gümrük",
  generator: "v0.dev",
  openGraph: {
    type: "website",
    url: "https://www.ardiyesizgiris.com/",
    title:
      "Ardiyesiz Giriş Hesaplama | Tüm Limanlarda Ardiyesiz Gününü Anında Öğrenin",
    description:
      "Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli ardiyesiz gün hesaplama aracı.",
    siteName: "Ardiyesiz Giriş",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ardiyesiz Giriş Hesaplama | Tüm Limanlarda Ardiyesiz Gününü Anında Öğrenin",
    description:
      "Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli ardiyesiz gün hesaplama aracı.",
  },
} as const

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ardiyesiz Giriş",
    url: "https://www.ardiyesizgiris.com",
    sameAs: [],
    logo: "https://www.ardiyesizgiris.com/favicon.ico",
  }
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ardiyesiz Giriş",
    url: "https://www.ardiyesizgiris.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.ardiyesizgiris.com/?q={search_term_string}",
      },
      queryInput: "required name=search_term_string",
    },
  }

  return (
    <html lang="tr" suppressHydrationWarning className={`${inter.variable} ${interTight.variable}`}>
      <body className="font-sans antialiased">
        <ScrollLockGuard />
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AuthSessionProvider>
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(orgJsonLd)}
        </Script>
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(siteJsonLd)}
        </Script>
        <Analytics />
      </body>
    </html>
  )
}
