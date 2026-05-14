import type { Metadata } from "next"
import { Shield, Users, Ship, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Hakkımızda | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş, Türkiye limanlarında konteyner taşımacılığı için ardiyesiz giriş tarihi ve demurrage & detention hesaplama hizmeti sunar.",
  alternates: { canonical: "https://www.ardiyesizgiris.com/hakkimizda" },
}

const values = [
  {
    icon: Ship,
    title: "Uzmanlık",
    description: "Yılların deneyimiyle Türkiye liman operasyonlarında uzman çözümler sunuyoruz.",
  },
  {
    icon: Shield,
    title: "Güvenilirlik",
    description: "Doğru ve güncel verilerle hesaplamalarınızın hatasız olmasını sağlıyoruz.",
  },
  {
    icon: Users,
    title: "Müşteri Odaklılık",
    description: "Müşterilerimizin ihtiyaçlarını önceliklendirerek en iyi kullanıcı deneyimini sunuyoruz.",
  },
  {
    icon: Award,
    title: "Kalite",
    description: "Sürekli güncellenen altyapımızla sektör standartlarının üzerinde hizmet veriyoruz.",
  },
]

export default function HakkimizdaPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Hakkımızda
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Ardiyesiz Giriş, Türkiye limanlarında konteyner taşımacılığı yapan firmalar için
              ardiyesiz giriş tarihi ve demurrage & detention masraf hesaplama platformudur.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6">Misyonumuz</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Lojistik sektöründe ardiyesiz giriş hesaplamalarını hızlı, doğru ve kullanıcı dostu
              bir platformda sunarak operasyonel verimliliği artırmak. Türkiye&apos;nin tüm limanları
              için güncel muafiyet kuralları ve ücret tarifeleriyle anında hesaplama imkanı sağlıyoruz.
            </p>

            <h2 className="font-display text-2xl font-bold mb-6">Vizyonumuz</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Türkiye&apos;nin lider ardiyesiz giriş hesaplama platformu olarak, lojistik firmalarının
              zaman ve maliyet tasarrufu yapmasına katkıda bulunmak. Sürekli gelişen teknolojimizle
              sektörün dijital dönüşümüne öncülük etmek.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 tracking-tight">
            Değerlerimiz
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold mb-6">İletişim</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Sorularınız, önerileriniz veya iş birliği için bizimle iletişime geçmekten
              çekinmeyin.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/iletisim"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                İletişim Formu
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
