import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş kullanım koşulları — platformumuzu kullanırken uymanız gereken kurallar ve şartlar.",
}

export default function KullanimKosullariPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
        Kullanım Koşulları
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Son güncelleme: Haziran 2026
      </p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Hizmet Tanımı</h2>
          <p>
            Ardiyesiz Giriş, konteyner taşımacılığında ardiyesiz giriş tarihlerinin
            hesaplanmasını sağlayan bir web platformudur. Sağlanan hesaplama
            sonuçları bilgilendirme amaçlıdır ve kesinlik garantisi taşımaz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Kullanıcı Yükümlülükleri
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Doğru ve güncel bilgi sağlamak</li>
            <li>Hesap bilgilerinin gizliliğini korumak</li>
            <li>Platformu yasal amaçlarla kullanmak</li>
            <li>Başkalarının hesaplarına erişmeye çalışmamak</li>
            <li>Sisteme zarar verebilecek eylemlerden kaçınmak</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Fikri Mülkiyet
          </h2>
          <p>
            Platform üzerindeki tüm içerik, tasarım, yazılım ve markalar Ardiyesiz
            Giriş'e aittir. İzinsiz kopyalama, dağıtma veya kullanma yasaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Hizmet Kesintisi
          </h2>
          <p>
            Ardiyesiz Giriş, planlı bakım veya öngörülemeyen durumlar nedeniyle
            hizmet kesintisi yaşanabileceğini kabul eder. Bu kesintilerden doğan
            zararlardan sorumlu tutulamaz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Sorumluluk Sınırlaması
          </h2>
          <p>
            Platform üzerinden sağlanan hesaplama sonuçları referans niteliğindedir.
            Operasyonel kararlarınızı yalnızca bu sonuçlara dayandırmamanızı öneririz.
            Ardiyesiz Giriş, hesaplama sonuçlarına dayanarak alınan kararlardan
            doğabilecek zararlardan sorumlu değildir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Ücretlendirme</h2>
          <p>
            Ücretli planlarımız için geçerli fiyatlandırma sayfamızda belirtilmiştir.
            Fiyatlar önceden haber verilmeksizin değiştirilebilir. Mevcut aboneler
            için fiyat değişiklikleri bir sonraki fatura döneminde geçerli olur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. Sözleşme Değişiklikleri</h2>
          <p>
            Bu koşullar gerektiğinde güncellenebilir. Önemli değişiklikler e-posta
            yoluyla bildirilir. Platformu kullanmaya devam etmeniz, güncellenmiş
            koşulları kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">8. İletişim</h2>
          <p>
            Kullanım koşulları hakkında sorularınız için{" "}
            <a
              href="mailto:info@ardiyesizgiris.com"
              className="text-emerald-600 hover:underline"
            >
              info@ardiyesizgiris.com
            </a>{" "}
            adresinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}
