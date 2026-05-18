import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Ardiyesiz Giriş",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metni.",
  alternates: { canonical: "https://www.ardiyesizgiris.com/kvkk" },
}

export default function KvkkPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Son güncelleme: 17 Mayıs 2026
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, kişisel
            verileriniz; ardiyesizgiris.com platformunu işleten hizmet sağlayıcı tarafından Veri
            Sorumlusu sıfatıyla işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. İşlenen Kişisel Veriler</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Kimlik verileri:</strong> Ad soyad</li>
            <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası</li>
            <li><strong>İş yeri bilgisi:</strong> Şirket adı</li>
            <li><strong>İşlem verileri:</strong> Gerçekleştirilen hesaplama kayıtları, kullanım istatistikleri</li>
            <li><strong>Teknik veriler:</strong> IP adresi, oturum bilgileri, tarayıcı ve cihaz bilgileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Üyelik ve kimlik doğrulama işlemlerinin yürütülmesi</li>
            <li>Hesaplama hizmetinin sunulması ve kişiselleştirilmesi</li>
            <li>Müşteri destek taleplerinin karşılanması</li>
            <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hizmet kalitesinin iyileştirilmesi amacıyla istatistiksel analiz yapılması</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Hukuki Dayanak</h2>
          <p>
            Kişisel verileriniz; KVKK m. 5/2 kapsamında &ldquo;sözleşmenin kurulması veya ifası&rdquo;
            ve &ldquo;veri sorumlusunun meşru menfaati&rdquo; hukuki sebeplerine dayanılarak, gerektiğinde
            açık rızanıza istinaden işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz; hizmetin sağlanması amacıyla yurt içindeki ve yurt dışındaki
            altyapı sağlayıcılarına (barındırma, e-posta gönderim servisleri), yasal zorunluluk
            kapsamında yetkili kamu kurum ve kuruluşlarına aktarılabilir. Bu aktarımlar KVKK&apos;nın
            8. ve 9. maddelerinde belirtilen güvenlik tedbirleri çerçevesinde gerçekleştirilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Saklama Süresi</h2>
          <p>
            Kişisel verileriniz, üyelik ilişkisi süresince ve ilişkinin sona ermesinden itibaren
            yasal yükümlülükler gereği belirlenen süreler boyunca saklanır. Bu sürelerin dolmasının
            ardından veriler silinir, yok edilir veya anonim hale getirilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. İlgili Kişi Hakları (KVKK m. 11)</h2>
          <p>Kişisel verilerinize ilişkin olarak aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen kişisel verilerinize ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve bu amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
            <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme</li>
            <li>Veriler üzerinde gerçekleştirilen işlemlerin üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Başvuru Yöntemi</h2>
          <p>
            Yukarıda sayılan haklarınızı kullanmak için{" "}
            <a href="/iletisim" className="underline underline-offset-4 hover:text-primary">
              iletişim formu
            </a>{" "}
            aracılığıyla veya kayıtlı e-posta adresinizden yazılı başvuru yapabilirsiniz.
            Başvurularınız en geç 30 (otuz) gün içinde sonuçlandırılacaktır.
          </p>
        </section>

      </div>
    </div>
  )
}
