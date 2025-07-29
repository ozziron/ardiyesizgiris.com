import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar, Info, Calculator } from "lucide-react"
import { LimanKarsilastirma } from "@/components/liman-karsilastirma"

export const metadata: Metadata = {
  title: "Limanlar | Ardiyesiz Giriş",
  description: "Türkiye'deki tüm limanlar hakkında bilgi edinin ve ardiyesiz giriş kurallarını öğrenin.",
}

const limanlar = [
  {
    id: "istanbul",
    ad: "İstanbul Limanı",
    konum: "İstanbul, Türkiye",
    resim: "/placeholder.svg?height=200&width=400",
    aciklama:
      "İstanbul Limanı, Türkiye'nin en büyük konteyner limanlarından biridir. Marmara Denizi'nde stratejik bir konuma sahiptir.",
    ozellikler: ["Konteyner", "Genel Kargo", "Ro-Ro", "Yolcu"],
  },
  {
    id: "izmir",
    ad: "İzmir Limanı",
    konum: "İzmir, Türkiye",
    ardiyesizGun: 5,
    resim: "/placeholder.svg?height=200&width=400",
    aciklama: "İzmir Limanı, Ege Bölgesi'nin en önemli limanıdır. Geniş hinterlandı ile önemli bir ticaret merkezidir.",
    ozellikler: ["Konteyner", "Genel Kargo", "Dökme Yük"],
  },
  {
    id: "mersin",
    ad: "Mersin Limanı",
    konum: "Mersin, Türkiye",
    ardiyesizGun: 10,
    resim: "/placeholder.svg?height=200&width=400",
    aciklama: "Mersin Limanı, Akdeniz'in doğusunda yer alan önemli bir konteyner ve genel kargo limanıdır.",
    ozellikler: ["Konteyner", "Genel Kargo", "Dökme Yük", "Sıvı Yük"],
  },
  {
    id: "iskenderun",
    ad: "İskenderun Limanı",
    konum: "İskenderun, Türkiye",
    ardiyesizGun: 8,
    resim: "/placeholder.svg?height=200&width=400",
    aciklama: "İskenderun Limanı, özellikle demir-çelik endüstrisi için önemli bir limandır.",
    ozellikler: ["Konteyner", "Genel Kargo", "Dökme Yük"],
  },
  {
    id: "samsun",
    ad: "Samsun Limanı",
    konum: "Samsun, Türkiye",
    ardiyesizGun: 6,
    resim: "/placeholder.svg?height=200&width=400",
    aciklama: "Samsun Limanı, Karadeniz'in en önemli limanlarından biridir.",
    ozellikler: ["Konteyner", "Genel Kargo", "Ro-Ro"],
  },
  {
    id: "antalya",
    ad: "Antalya Limanı",
    konum: "Antalya, Türkiye",
    ardiyesizGun: 7,
    resim: "/placeholder.svg?height=200&width=400",
    aciklama: "Antalya Limanı, turizm ve ticaret açısından önemli bir limandır.",
    ozellikler: ["Konteyner", "Genel Kargo", "Yolcu"],
  },
]

export default function LimanlarPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Türkiye Limanları</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Türkiye'deki tüm limanlar hakkında bilgi edinin ve ardiyesiz giriş kurallarını öğrenin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {limanlar.map((liman) => (
          <Card key={liman.id} className="overflow-hidden">
            <div className="aspect-video w-full bg-muted">
              <img src={liman.resim || "/placeholder.svg"} alt={liman.ad} className="object-cover w-full h-full" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{liman.ad}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {liman.ardiyesizGun} Gün
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {liman.konum}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{liman.aciklama}</p>
              <div className="flex flex-wrap gap-2">
                {liman.ozellikler.map((ozellik) => (
                  <Badge key={ozellik} variant="secondary">
                    {ozellik}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/limanlar/${liman.id}`}>
                  <Info className="mr-2 h-4 w-4" />
                  Detaylı Bilgi
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Liman Karşılaştırma</h2>
        <LimanKarsilastirma limanlar={limanlar} />
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Ardiyesiz Giriş Nedir?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Ardiyesiz giriş, konteyner taşımacılığında konteynerlerin limana vardıktan sonra belirli bir süre içinde
            herhangi bir depolama ücreti ödemeden çekilebilmesi anlamına gelir. Bu süre, her liman için farklılık
            gösterebilir.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Ardiyesiz Süre Hesaplama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ardiyesiz süre genellikle geminin limana varış tarihinden itibaren başlar. Bu süre içinde konteynerinizi
                çekerseniz herhangi bir depolama ücreti ödemezsiniz. Süre aşımında ise günlük ardiye ücretleri
                uygulanır.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/hesaplama">
                  <Calculator className="mr-2 h-4 w-4" />
                  Hesaplama Aracına Git
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Önemli Faktörler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Konşimento tarihi ve varış tarihi</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Konteyner tipi (standart, soğutuculu, tehlikeli madde vb.)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>İthalat veya ihracat işlemi olması</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Resmi tatiller ve hafta sonları</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/blog/ardiyesiz-giris-faktörleri">
                  <Info className="mr-2 h-4 w-4" />
                  Daha Fazla Bilgi
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
