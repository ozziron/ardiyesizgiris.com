import type { Metadata } from "next"
import Link from "next/link"
import { portLandingData } from "@/lib/content/ports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CtaSection } from "@/components/cta-section"
import { Ship, MapPin, ArrowRight, Anchor, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Limanlar Ardiyesiz Giriş Hesaplama | Tüm Türkiye Limanları",
  description:
    "Tüm Türkiye limanları için ardiyesiz giriş hesaplama. Ambarlı, Mersin, Aliağa, Gemlik ve diğer limanlarda ardiye ücretleri ve serbest günler.",
  alternates: { canonical: "https://www.ardiyesizgiris.com/limanlar" },
  openGraph: {
    title: "Limanlar Ardiyesiz Giriş Hesaplama | Tüm Türkiye Limanları",
    description:
      "Tüm Türkiye limanları için ardiyesiz giriş hesaplama. Ambarlı, Mersin, Aliağa, Gemlik ve diğer limanlarda ardiye ücretleri ve serbest günler.",
    type: "website",
    url: "https://www.ardiyesizgiris.com/limanlar",
    siteName: "Ardiyesiz Giriş",
    locale: "tr_TR",
  },
}

export default function LimanlarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-6">
              <Anchor className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Limanlara Göre Ardiyesiz Giriş Hesaplama
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Türkiye&apos;nin tüm büyük konteyner limanları için güncel
              ardiye tarifeleri ve ardiyesiz giriş hesaplaması. Limanınızı
              seçin, ardiyesiz gününüzü hemen öğrenin.
            </p>
          </div>
        </div>
      </section>

      {/* Port Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {portLandingData.map((port) => (
              <Link
                key={port.code}
                href={`/limanlar/${port.code}`}
                className="group"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Ship className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          {port.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {port.city}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 flex-shrink-0 mt-1" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {port.seoDescription}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {port.keyFeatures.slice(0, 2).map((feat) => (
                        <span
                          key={feat}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-[11px] text-emerald-700 dark:text-emerald-300"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {feat.length > 45
                            ? feat.slice(0, 45) + "..."
                            : feat}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection />
    </>
  )
}
