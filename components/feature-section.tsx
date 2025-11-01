import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Clock, Calendar, TrendingUp, Anchor, BarChart } from "lucide-react"

export function FeatureSection() {
  return (
    <section id="ozellikler" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Neden Ardiyesiz Giriş?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Konteyner taşımacılığında zaman ve maliyet tasarrufu sağlayan araçlarımızla lojistik süreçlerinizi optimize
            edin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Calculator className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Doğru Hesaplama</CardTitle>
              <CardDescription>
                Tüm Türkiye limanları için güncel ve doğru ardiyesiz giriş hesaplaması yapın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Algoritmasımız, her limanın özel kurallarını ve tatil günlerini dikkate alarak en doğru sonucu verir.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Zaman Tasarrufu</CardTitle>
              <CardDescription>Hesaplamaları manuel yapmak yerine saniyeler içinde sonuç alın.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Karmaşık hesaplamaları otomatikleştirerek operasyonel süreçlerinizi hızlandırın ve hatalardan kaçının.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Maliyet Optimizasyonu</CardTitle>
              <CardDescription>Ardiye maliyetlerini minimize edin ve bütçe planlamanızı iyileştirin.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Ardiyesiz günleri maksimum verimlilikle kullanarak gereksiz depolama maliyetlerinden kurtulun.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Güncel Bilgiler</CardTitle>
              <CardDescription>Tüm limanların güncel ardiyesiz gün politikalarına erişin.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Veritabanımız sürekli güncellenerek tüm limanların en son kurallarını ve değişikliklerini içerir.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Anchor className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Tüm Limanlar</CardTitle>
              <CardDescription>Türkiye'deki tüm büyük limanlar için hesaplama yapın.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                İstanbul, İzmir, Mersin, İskenderun ve daha birçok liman için özelleştirilmiş hesaplamalar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Detaylı Raporlar</CardTitle>
              <CardDescription>Hesaplamalarınızı kaydedin ve detaylı raporlar alın.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Tüm hesaplamalarınızı kaydedebilir, paylaşabilir ve geçmiş verilerinize istediğiniz zaman
                erişebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
