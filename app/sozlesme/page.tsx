import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hizmet Sözleşmesi | Ardiyesiz Giriş",
  description:
    "Ardiyesiz Giriş platformuna ilişkin kullanım koşulları, sorumluluk sınırları ve hizmet şartları.",
  alternates: { canonical: "https://www.ardiyesizgiris.com/sozlesme" },
}

export default function SozlesmePage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Hizmet Sözleşmesi</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Son güncelleme: 17 Mayıs 2026 &mdash; Sürüm 1.0
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Taraflar</h2>
          <p>
            Bu Hizmet Sözleşmesi (&ldquo;Sözleşme&rdquo;), ardiyesizgiris.com alan adı üzerinden
            sunulan ardiyesiz giriş ve ardiye ücreti hesaplama platformunu (&ldquo;Platform&rdquo;)
            işleten hizmet sağlayıcı ile Platforma kaydolan veya Platformu kullanan gerçek ya da
            tüzel kişi (&ldquo;Kullanıcı&rdquo;) arasında akdedilmiştir. Platforma kayıt olarak veya
            Platformu kullanarak bu Sözleşme&apos;nin tüm hükümlerini okuduğunuzu, anladığınızı ve
            kabul ettiğinizi beyan etmiş olursunuz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Hizmetin Kapsamı</h2>
          <p>
            Platform, ihracat konteynerleri için ardiyesiz giriş tarihlerinin hesaplanması ve
            ardiye ücretinin tahmini amacıyla tasarlanmış bir bilgi yönetim aracıdır. Platform
            aracılığıyla sunulan hesaplamalar ve veriler yalnızca bilgilendirme amacı taşımaktadır;
            kesinlikle hukuki, mali veya lojistik danışmanlık niteliği taşımaz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Sorumluluk Reddi ve Tahmini Hesaplama Bildirimi</h2>
          <p className="font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4">
            Platform üzerinden gerçekleştirilen tüm masraf hesaplamaları TAHMİNİ niteliktedir.
            Hesaplama sonuçları kesin, bağlayıcı veya garantili değildir. Nihai ardiye ücreti;
            liman tarafından uygulanan kur farkı, özel tarife güncellemeleri, hat politika değişiklikleri,
            ek hizmet bedelleri veya operasyonel gecikmeler nedeniyle farklılık gösterebilir.
          </p>
          <p className="mt-3">
            Kullanıcı, Platform üzerindeki hesaplamaları bağımsız bir karar aracı olarak kullanmayı
            kabul eder ve hesaplama sonuçlarına dayanarak verdiği kararların sorumluluğunun tamamının
            kendisine ait olduğunu kabul eder.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Veri Doğruluğu</h2>
          <p>
            Platform, liman, hat, tarife ve muafiyet verilerini mümkün olduğunca güncel tutmak için
            çalışmaktadır. Bununla birlikte söz konusu veriler anlık güncellemeye tabi olup her
            zaman tamamen doğru, eksiksiz veya güncel olduğu garanti edilemez. Kullanıcı, işlem
            öncesinde ilgili hat ya da liman yetkilileri ile doğrulama yapmakla sorumludur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Kullanım Koşulları</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Platform yalnızca yasal amaçlarla kullanılabilir.</li>
            <li>Platform üzerinden elde edilen veriler ticari amaçla üçüncü taraflara satılamaz veya devredilemez.</li>
            <li>Otomatik erişim (bot, scraper vb.) için önceden yazılı izin alınması zorunludur.</li>
            <li>Platforma zarar verebilecek her türlü girişim kesinlikle yasaktır.</li>
            <li>Kullanıcı, hesap bilgilerinin gizliliğinden ve güvenliğinden sorumludur.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Sorumluluk Sınırlaması</h2>
          <p>
            Platform, hizmetin kesintisiz veya hatasız çalışacağını garanti etmez. Hesaplama
            sonuçları nedeniyle doğabilecek doğrudan, dolaylı, arızi veya sonuçsal zararlar dahil
            olmak üzere her türlü zarar ve kayıptan hizmet sağlayıcı sorumlu tutulamaz. Kullanıcı,
            bu Sözleşme&apos;yi kabul ederek söz konusu sorumluluk sınırlamalarını açıkça kabul etmiş
            olur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Üyelik ve Hesap</h2>
          <p>
            Platform&apos;a kayıt için geçerli bir e-posta adresi gerekmektedir. Kullanıcı, kayıt
            sırasında sağladığı bilgilerin doğruluğundan sorumludur. Yanlış bilgi ile oluşturulan
            hesaplar önceden bildirim yapılmaksızın askıya alınabilir veya silinebilir. Ücretsiz
            kullanım kotası dahilindeki hesaplar için herhangi bir ücret talep edilmez; premium
            planlar ayrıca açıklanır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Fikri Mülkiyet</h2>
          <p>
            Platform&apos;un tüm tasarım unsurları, hesaplama algoritmaları, yazılım kodu ve içerikleri
            hizmet sağlayıcıya aittir ve Türk Fikir ve Sanat Eserleri Kanunu ile uluslararası telif
            hakkı mevzuatı kapsamında koruma altındadır. İzinsiz kopyalama, çoğaltma veya dağıtım
            yasaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Değişiklikler</h2>
          <p>
            Hizmet sağlayıcı, bu Sözleşme&apos;yi önceden bildirimde bulunmaksızın değiştirme hakkını
            saklı tutar. Değişiklikler Platform üzerinde yayımlandığı tarihte yürürlüğe girer.
            Değişikliklerin ardından Platformu kullanmaya devam etmeniz, güncel Sözleşme&apos;yi kabul
            ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Uygulanacak Hukuk</h2>
          <p>
            Bu Sözleşme Türk Hukuku&apos;na tabidir. Sözleşmeden doğabilecek uyuşmazlıklarda İstanbul
            Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. İletişim</h2>
          <p>
            Sözleşme&apos;ye ilişkin sorularınız için{" "}
            <a
              href="/iletisim"
              className="underline underline-offset-4 hover:text-primary"
            >
              iletişim sayfamızı
            </a>{" "}
            kullanabilirsiniz.
          </p>
        </section>

      </div>
    </div>
  )
}
