import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  metadataBase: new URL("https://www.ardiyesizgiris.com"),
  title:
    "Ardiyesiz Giriş Hesaplama | Tüm Limanlarda Ardiyesiz Gününü Anında Öğrenin",
  description:
    "Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli ardiyesiz gün hesaplama aracı.",
  keywords:
    "ardiyesiz giriş, konteyner, liman, lojistik, ardiye hesaplama, gümrük",
  generator: "v0.dev",
  alternates: {
    canonical: "/",
  },
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
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

