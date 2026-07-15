import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş gizlilik politikası — kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi edinin. iOS ve Android uygulamaları dahil tüm platformları kapsar.",
  alternates: { canonical: "https://www.ardiyesizgiris.com/gizlilik-politikasi" },
}

export default function GizlilikPolitikasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
        Gizlilik Politikası
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Son güncelleme: 29 Haziran 2026
      </p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Giriş</h2>
          <p>
            Ardiyesiz Giriş (&ldquo;biz&rdquo; veya &ldquo;uygulama&rdquo;)
            olarak gizliliğinize saygı duyuyoruz. Bu Gizlilik Politikası;
            web sitemiz (<code>ardiyesizgiris.com</code>), iOS mobil uygulaması
            ve Android mobil uygulaması dahil tüm platformlarımızda hangi
            verileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu
            açıklar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Topladığımız Veriler
          </h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            2.1. Bize Sağladığınız Veriler
          </h3>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Hesap bilgileri:</strong> Ad soyad, e-posta adresi, telefon
              numarası, şirket adı — kayıt sırasında doğrudan sizin
              tarafınızdan sağlanır.
            </li>
            <li>
              <strong>İşlem verileri:</strong> Gerçekleştirdiğiniz hesaplama
              sorguları ve sonuçları, liman ve konteyner tipi tercihleri.
            </li>
            <li>
              <strong>İletişim kayıtları:</strong> Destek talepleri, iletişim
              formu mesajları ve e-posta yazışmaları.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            2.2. Otomatik Toplanan Veriler
          </h3>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Cihaz ve bağlantı bilgileri:</strong> IP adresi, tarayıcı
              türü ve sürümü, işletim sistemi, ekran çözünürlüğü, dil tercihi.
            </li>
            <li>
              <strong>Kullanım verileri:</strong> Ziyaret edilen sayfalar,
              tıklanan öğeler, oturum süresi, etkileşim istatistikleri
              (Vercel Analytics aracılığıyla anonim olarak toplanır).
            </li>
            <li>
              <strong>Performans verileri:</strong> Sayfa yüklenme süreleri,
              Core Web Vitals metrikleri (Vercel Speed Insights aracılığıyla
              anonim olarak toplanır).
            </li>
            <li>
              <strong>Hata raporları:</strong> Uygulama hatalarına ilişkin
              anonim tanılama verileri.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Verilerin Kullanım Amaçları
          </h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Hizmetin sunulması:</strong> Hesap oluşturma, kimlik doğrulama, hesaplama işlemlerinin yürütülmesi.</li>
            <li><strong>Hizmetin iyileştirilmesi:</strong> Kullanım istatistiklerinin analizi, hata tespiti, performans optimizasyonu.</li>
            <li><strong>İletişim:</strong> Destek taleplerinin yanıtlanması, önemli hizmet bildirimlerinin iletilmesi.</li>
            <li><strong>Güvenlik:</strong> Platformun kötüye kullanımının önlenmesi, yasal yükümlülüklerin yerine getirilmesi.</li>
            <li><strong>Kişiselleştirme:</strong> Kullanım geçmişinize dayalı varsayılan liman ve konteyner tipi önerileri.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Veri Paylaşımı ve Üçüncü Taraflar
          </h2>
          <p>
            Kişisel verilerinizi hiçbir şekilde satmıyoruz. Verileriniz
            yalnızca hizmetin sağlanması için gerekli olan durumlarda üçüncü
            taraflarla paylaşılır:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Altyapı sağlayıcıları:</strong> Neon Postgres (veritabanı
              barındırma), Resend (e-posta gönderimi), Vercel Analytics ve
              Speed Insights (anonim kullanım ve performans analitiği).
            </li>
            <li>
              <strong>Yasal zorunluluklar:</strong> Mahkeme kararı veya yasal
              yükümlülük kapsamında yetkili kurumlarla paylaşım.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Veri Güvenliği ve Saklama
          </h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Tüm veri iletimi TLS (HTTPS) ile şifrelenir.</li>
            <li>Parolalar sektör standardı hash algoritmaları ile saklanır.</li>
            <li>Veritabanı erişimi yalnızca yetkili sistemlerle sınırlıdır.</li>
          </ul>
          <p className="mt-2">
            Verileriniz, hesabınız aktif olduğu sürece ve yasal saklama
            yükümlülükleri kapsamında gerekli süre boyunca saklanır.
            Hesabınızın silinmesini talep ettiğinizde, verileriniz yasal
            sürelerin dolmasının ardından kalıcı olarak silinir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Çerezler</h2>
          <p>
            Uygulamamız yalnızca hizmetin çalışması için gerekli işlevsel
            çerezleri kullanır:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Oturum çerezleri:</strong> Kimlik doğrulama durumunuzu
              korumak için (NextAuth.js oturum token&apos;ı).
            </li>
            <li>
              <strong>Tercih çerezleri:</strong> Tema tercihinizi
              (açık/koyu) hatırlamak için (tarayıcı yerel depolaması).
            </li>
          </ul>
          <p className="mt-2">
            Reklam, pazarlama veya kullanıcı davranışı izleme amaçlı üçüncü
            taraf çerezleri kullanmıyoruz. Detaylı bilgi için{" "}
            <a href="/cerez-politikasi" className="text-emerald-600 hover:underline">
              Çerez Politikası
            </a>
            &apos;nı inceleyin.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Mobil Uygulama İzinleri
          </h2>
          <p>
            iOS ve Android mobil uygulamalarımız cihazınızda aşağıdaki hassas
            izinlerden hiçbirini <strong>kullanmaz veya talep etmez:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Kamera</li>
            <li>Mikrofon</li>
            <li>Konum (GPS)</li>
            <li>Kişiler / Rehber</li>
            <li>Fotoğraflar / Medya</li>
            <li>Bluetooth</li>
            <li>Sağlık verileri / HealthKit</li>
          </ul>
          <p className="mt-2">
            Uygulama yalnızca internet bağlantısı kullanır. App Tracking
            Transparency (ATT) kapsamında herhangi bir kullanıcı veya cihaz
            takibi yapılmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            8. Çocukların Gizliliği
          </h2>
          <p>
            Hizmetimiz 18 yaşın altındaki bireylere yönelik değildir.
            Bilerek 18 yaş altı kişilerden kişisel veri toplamıyoruz. Böyle
            bir durumu fark ederseniz derhal bizimle iletişime geçin.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">9. Haklarınız</h2>
          <p>6698 sayılı KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen verilerinize erişim talep etme</li>
            <li>Eksik veya yanlış verilerin düzeltilmesini isteme</li>
            <li>Verilerinizin silinmesini talep etme</li>
            <li>Veri işlemenin kısıtlanmasını talep etme</li>
            <li>Veri taşınabilirliği talep etme</li>
          </ul>
          <p className="mt-2">
            Haklarınızı kullanmak için{" "}
            <a href="/iletisim" className="text-emerald-600 hover:underline">
              iletişim formu
            </a>{" "}
            aracılığıyla bize ulaşabilirsiniz. Başvurularınız en geç 30 gün
            içinde sonuçlandırılır. KVKK kapsamındaki detaylı bilgi için{" "}
            <a href="/kvkk" className="text-emerald-600 hover:underline">
              KVKK Aydınlatma Metni
            </a>
            &apos;ni inceleyin.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            10. Politika Değişiklikleri
          </h2>
          <p>
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde
            kayıtlı e-posta adresiniz üzerinden sizi bilgilendireceğiz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">11. İletişim</h2>
          <p>
            Gizlilik politikamızla ilgili sorularınız için{" "}
            <a
              href="mailto:info@ardiyesizgiris.com"
              className="text-emerald-600 hover:underline"
            >
              info@ardiyesizgiris.com
            </a>{" "}
            adresinden veya{" "}
            <a href="/iletisim" className="text-emerald-600 hover:underline">
              iletişim formu
            </a>
            &apos;ndan bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}
