import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş gizlilik politikası — kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi edinin.",
}

export default function GizlilikPolitikasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
        Gizlilik Politikası
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Son güncelleme: Haziran 2026
      </p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Toplanan Bilgiler</h2>
          <p>
            Ardiyesiz Giriş olarak, hizmetlerimizi sunabilmek için aşağıdaki
            bilgileri toplarız:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Ad, soyad ve e-posta adresi (hesap oluşturma sırasında)</li>
            <li>Hesaplama geçmişi ve liman tercihleri</li>
            <li>Kullanım istatistikleri ve cihaz bilgileri</li>
            <li>Çerezler aracılığıyla oturum ve tercih bilgileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Bilgilerin Kullanımı
          </h2>
          <p>Toplanan bilgiler aşağıdaki amaçlarla kullanılır:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Hesaplama hizmetinin sunulması ve iyileştirilmesi</li>
            <li>Kullanıcı deneyiminin kişiselleştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Veri Paylaşımı
          </h2>
          <p>
            Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla
            paylaşılmaz. Hizmet sağlayıcılarımız (altyapı, e-posta) yalnızca hizmetin
            ifası için gerekli verilere erişir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">4. Veri Güvenliği</h2>
          <p>
            Verileriniz endüstri standardı şifreleme ve güvenlik önlemleriyle
            korunur. Hesap güvenliğiniz için güçlü parola kullanmanızı öneririz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">5. Çerezler</h2>
          <p>
            Sitemiz, oturum yönetimi ve kullanıcı tercihlerinin hatırlanması için
            çerezler kullanır. Çerez tercihlerinizi tarayıcı ayarlarından
            yönetebilirsiniz. Detaylı bilgi için Çerez Politikamızı inceleyin.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Haklarınız</h2>
          <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Kişisel verilerinize erişim talep etme</li>
            <li>Verilerinizin düzeltilmesini veya silinmesini isteme</li>
            <li>İşlemenin kısıtlanmasını talep etme</li>
            <li>Veri taşınabilirliği hakkını kullanma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. İletişim</h2>
          <p>
            Gizlilik politikamızla ilgili sorularınız için{" "}
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
