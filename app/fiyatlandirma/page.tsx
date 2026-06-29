import type { Metadata } from "next"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Fiyatlandırma | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş fiyatlandırma planlarını inceleyin. Ücretsiz başlayın, ihtiyacınıza göre büyüyün.",
}

const PLANS = [
  {
    name: "Ücretsiz",
    price: "0 ₺",
    period: "/ay",
    description: "Bireysel kullanıcılar için temel hesaplama özellikleri.",
    features: [
      "Ayda 10 hesaplama",
      "Temel ardiyesiz gün hesaplama",
      "E-posta desteği",
      "Web üzerinden erişim",
    ],
    cta: "Ücretsiz Başla",
    href: "/kayit",
    featured: false,
  },
  {
    name: "Profesyonel",
    price: "249 ₺",
    period: "/ay",
    description: "Lojistik profesyonelleri için gelişmiş özellikler.",
    features: [
      "Sınırsız hesaplama",
      "Tüm liman ve armatör tarifeleri",
      "PDF rapor çıktısı",
      "Hesaplama geçmişi",
      "Öncelikli e-posta desteği",
      "Mobil uygulama erişimi",
    ],
    cta: "Hemen Başla",
    href: "/kayit?plan=pro",
    featured: true,
  },
  {
    name: "Kurumsal",
    price: "İletişime Geçin",
    period: "",
    description: "Büyük ölçekli operasyonlar için özelleştirilmiş çözümler.",
    features: [
      "Profesyonel'deki her şey",
      "Özel tarife yönetimi",
      "API erişimi",
      "Çok kullanıcılı ekip yönetimi",
      "Öncelikli telefon desteği",
      "Kişiselleştirilmiş raporlama",
      "SLA garantisi",
    ],
    cta: "İletişime Geçin",
    href: "/iletisim",
    featured: false,
  },
]

export default function FiyatlandirmaPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="outline" className="mb-4">
          Fiyatlandırma
        </Badge>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-100">
          İhtiyacınıza Uygun Planı Seçin
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
          Ücretsiz başlayın, operasyonlarınız büyüdükçe yükseltin. Tüm planlarda
          Türkiye limanları için güncel tarifelerle hesaplama yapabilirsiniz.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.featured
                ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                : ""
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                  En Popüler
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>
                <span className="text-xl font-display font-bold">{plan.name}</span>
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.featured ? "default" : "outline"}
                className="mt-6 w-full"
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enterprise CTA */}
      <div className="text-center mt-16 max-w-xl mx-auto">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Özel ihtiyaçlarınız mı var? Kurumsal ekibimizle görüşerek size özel bir
          plan oluşturalım.
        </p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/iletisim">Kurumsal İletişim →</Link>
        </Button>
      </div>
    </div>
  )
}
