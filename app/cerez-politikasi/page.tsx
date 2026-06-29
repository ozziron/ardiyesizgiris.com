import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Çerez Politikası | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş çerez politikası — sitemizde kullanılan çerez türleri ve bunları nasıl yönetebileceğiniz hakkında bilgi edinin.",
}

export default function CerezPolitikasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
        Çerez Politikası
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Son güncelleme: Haziran 2026
      </p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Çerez Nedir?</h2>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla
            cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, site
            tercihlerinizi hatırlamak ve site deneyiminizi iyileştirmek için
            kullanılır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Kullandığımız Çerezler
          </h2>

          <h3 className="text-lg font-medium mt-4 mb-2">2.1. Zorunlu Çerezler</h3>
          <p>
            Bu çerezler sitenin temel işlevleri için gereklidir. Oturum açma,
            güvenlik ve form işlemleri gibi özellikleri mümkün kılarlar. Bu çerezler
            olmadan site düzgün çalışmaz.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">2.2. Analitik Çerezler</h3>
          <p>
            Site kullanımını anlamak ve iyileştirmek için anonim kullanım
            istatistikleri toplarız. Bu çerezler, hangi sayfaların en çok ziyaret
            edildiğini ve kullanıcıların sitede nasıl gezindiğini anlamamıza
            yardımcı olur.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">
            2.3. Tercih Çerezleri
          </h3>
          <p>
            Dil tercihi, tema seçimi (açık/koyu) gibi kişiselleştirme ayarlarınızı
            hatırlamak için kullanılır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Üçüncü Taraf Çerezleri
          </h2>
          <p>
            Hizmet sağlayıcılarımız (Vercel Analytics, Vercel Speed Insights)
            anonim performans ve kullanım verileri toplamak için çerezler
            kullanabilir. Bu çerezler üçüncü tarafların gizlilik politikalarına
            tabidir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Çerezleri Yönetme
          </h2>
          <p>
            Çoğu tarayıcı çerezleri otomatik olarak kabul eder. Tarayıcı
            ayarlarınızdan çerezleri engelleyebilir, silebilir veya çerez
            gönderildiğinde uyarı alabilirsiniz. Çerezleri devre dışı bırakmanız
            halinde sitemizin bazı özellikleri düzgün çalışmayabilir.
          </p>
          <p className="mt-2">Yaygın tarayıcılar için çerez ayarları:</p>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            <li>Google Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
            <li>Mozilla Firefox: Seçenekler → Gizlilik ve Güvenlik → Çerezler</li>
            <li>Safari: Tercihler → Gizlilik → Çerezler</li>
            <li>Microsoft Edge: Ayarlar → Çerezler ve Site İzinleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Politika Değişiklikleri
          </h2>
          <p>
            Bu çerez politikası gerektiğinde güncellenebilir. Değişiklikler sitemizde
            yayınlandığı tarihte yürürlüğe girer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. İletişim</h2>
          <p>
            Çerez politikamızla ilgili sorularınız için{" "}
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
