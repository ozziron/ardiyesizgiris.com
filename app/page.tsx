import Link from "next/link"
export const metadata = {
  alternates: { canonical: "https://www.ardiyesizgiris.com/" },
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ship, Calculator, Clock, Calendar } from "lucide-react"
import { Testimonials } from "@/components/testimonials"
import { FeatureSection } from "@/components/feature-section"
import { StatsSection } from "@/components/stats-section"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 -z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-white dark:bg-gray-800 shadow-sm">
                <Ship className="mr-1 h-3.5 w-3.5" />
                <span>Lojistik Çözümleri</span>
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Ardiyesiz Giriş Tarihini <span className="text-emerald-600">Anında</span> Hesaplayın
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Tüm limanlarda ardiyesiz gününü anında öğrenin. Konteyner taşımacılığında zaman ve maliyet tasarrufu
                sağlayın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/hesaplama">
                    <Calculator className="mr-2 h-5 w-5" />
                    Hemen Hesapla
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/#sss">Sık Sorulan Sorular</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">1,000+</span> kullanıcı tarafından güvenle kullanılıyor
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full">
                <div
                  className="absolute top-0 right-0 w-4/5 h-4/5 bg-container-green rounded-lg shadow-xl animate-float"
                  style={{ animationDelay: "0s" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                    Konteyner
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 w-4/5 h-4/5 bg-container-brown rounded-lg shadow-xl animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                    Konteyner
                  </div>
                </div>
                <div
                  className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-container-red rounded-lg shadow-xl animate-float"
                  style={{ animationDelay: "2s" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                    Konteyner
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <FeatureSection />

      {/* Nasıl Çalışır */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nasıl Çalışır?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Ardiyesiz giriş hesaplama aracımız, birkaç basit adımda size doğru bilgiyi sunar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Ship className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>1. Liman Seçin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Türkiye'deki tüm büyük limanlar sistemimizde mevcuttur. İşlem yapmak istediğiniz limanı seçin.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>2. Tarihleri Girin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Konşimento tarihi, varış tarihi gibi gerekli bilgileri girin. Sistemimiz otomatik olarak hesaplama
                  yapar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>3. Sonucu Alın</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Ardiyesiz giriş tarihinizi anında öğrenin. Sonucu kaydedin, paylaşın veya yazdırın. İşte bu kadar
                  basit!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <StatsSection />

      {/* Müşteri Yorumları */}
      <Testimonials />

      {/* SSS */}
      <FaqSection />

      {/* CTA */}
      <CtaSection />
    </>
  )
}
