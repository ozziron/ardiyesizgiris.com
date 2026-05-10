import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"

export function CtaSection() {
  return (
    <section id="cta" className="py-16 bg-emerald-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Hesaplamaya Başlayın</h2>
          <p className="text-lg mb-8 opacity-90">
            Ardiyesiz giriş tarihlerinizi hesaplayın, zaman ve maliyet tasarrufu sağlayın. Tüm Türkiye limanları için
            geçerli hesaplama aracımızı hemen deneyin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/hesaplama">
                <Calculator className="mr-2 h-5 w-5" />
                Ücretsiz Hesaplama Yap
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10" asChild>
              <Link href="/iletisim">Bize Ulaşın</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
