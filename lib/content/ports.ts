/**
 * SEO Port Landing Pages — Temsili liman veri seti.
 *
 * Growth ekibi hedef liman listesini belirlediğinde bu dosyayı
 * güncelleyebilir. Her liman `code`, `name`, `city`, `seoDescription`,
 * `content` (zengin içerik) ve `metaTitle`/`metaDescription` alanlarını
 * içerir.
 *
 * YENİ LİMAN EKLEMEK İÇİN: Dizinin sonuna yeni bir obje ekleyin.
 * `code` benzersiz olmalı, URL'de kullanılacak (örn: /limanlar/tramb).
 */

export interface PortLandingData {
  code: string
  name: string
  city: string
  metaTitle: string
  metaDescription: string
  seoDescription: string
  content: string
  keyFeatures: string[]
}

export const portLandingData: PortLandingData[] = [
  {
    code: "tramb",
    name: "Ambarlı Limanı",
    city: "İstanbul",
    metaTitle:
      "Ambarlı Limanı Ardiyesiz Giriş Hesaplama | İstanbul Konteyner Limanı",
    metaDescription:
      "Ambarlı Limanı için ardiyesiz giriş tarihi hesaplayın. İstanbul'un en büyük konteyner liman kompleksinde ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Ambarlı, İstanbul'un ve Marmara Bölgesi'nin en büyük konteyner liman kompleksidir. Kumport, Marport ve Mardaş terminallerini kapsar. Ardiyesiz giriş hesaplama aracımızla Ambarlı limanları için en uygun gate-in tarihini hesaplayın.",
    content: `Ambarlı Limanı, İstanbul'un Avrupa yakasında, Marmara Denizi kıyısında yer alan Türkiye'nin en büyük konteyner liman kompleksidir.

## Ambarlı Liman Kompleksi

Ambarlı'da üç büyük konteyner terminali bulunur:
- **Kumport:** En büyük kapasiteli terminal
- **Marport:** Batı terminali, modern ekipman
- **Mardaş:** Ambarlı'nın doğu yakası

## Ardiyesiz Giriş Hesaplama

Ambarlı limanları için ardiyesiz giriş hesaplaması yaparken:
- Armatör/hata göre değişen serbest gün sayılarını dikkate alın
- Konteyner tipi ve IMO durumuna göre değişen tarifeleri kontrol edin
- Kademeli ardiye ücretlendirmesini hesaplamaya dahil edin

## Ambarlı'da Operasyon İpuçları

- **Terminal seçimi önemli:** Kumport, Marport ve Mardaş arasında ardiye tarifeleri ve serbest gün uygulamaları farklılık gösterebilir. Hesaplama yaparken doğru terminali seçtiğinizden emin olun.
- **Yoğun dönemler:** Bayram öncesi ve yıl sonu sevkiyat dönemlerinde Ambarlı'da gate-in kuyrukları uzayabilir. Konteynerinizi serbest günlerin sonuna bırakmayın — en az 2-3 gün marjla planlayın.
- **Demiryolu avantajı:** Ambarlı'ya demiryolu bağlantısı mevcut. İç bölgelerden gelen yükler için karayoluna göre daha öngörülebilir transit süreleri sunar.
- **Çoklu hat karşılaştırması:** Ambarlı'ya sık sefer yapan 10'dan fazla konteyner hattı var. Hattınızın serbest gün politikasını diğer hatlarla karşılaştırarak en avantajlı opsiyonu seçin.

<div class="cta-block">

**Ambarlı limanları için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=tramb)

</div>`,
    keyFeatures: [
      "Türkiye'nin en büyük konteyner liman kompleksi",
      "3 büyük terminal: Kumport, Marport, Mardaş",
      "Yıllık 4 milyon+ TEU kapasite",
      "Demiryolu bağlantısı mevcut",
    ],
  },
  {
    code: "trmer",
    name: "Mersin Limanı",
    city: "Mersin",
    metaTitle:
      "Mersin Limanı Ardiyesiz Giriş Hesaplama | Akdeniz Konteyner Limanı",
    metaDescription:
      "Mersin Limanı için ardiyesiz giriş tarihi hesaplayın. Akdeniz Bölgesi'nin ana konteyner limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Mersin Limanı, Akdeniz Bölgesi'nin ana konteyner limanıdır. MIP (Mersin International Port) tarafından işletilir. Ardiyesiz giriş hesaplama aracımızla Mersin Limanı için en uygun gate-in tarihini hesaplayın.",
    content: `Mersin Limanı, Türkiye'nin güneyinde, Doğu Akdeniz kıyısında yer alan bölgenin en büyük konteyner limanıdır.

## Mersin International Port (MIP)

Mersin Limanı, MIP (Mersin International Port) tarafından işletilmektedir. Modern ekipman ve geniş depolama alanlarıyla hizmet verir.

## Ardiyesiz Giriş Hesaplama

Mersin Limanı için ardiyesiz giriş hesaplaması yaparken:
- MIP'in güncel ardiye tarifesini kullanın
- Akdeniz çıkışlı gemiler için tipik serbest gün uygulamalarını kontrol edin
- Bölgesel yoğunluk dönemlerini (narenciye sezonu vb.) dikkate alın

## Mersin'de Operasyon İpuçları

- **MIP tarifeleri:** Mersin International Port, Türkiye'nin en şeffaf ardiye tarifelerinden birini yayınlar. Güncel tarifeyi MIP web sitesinden kontrol ederek hesaplamanızı doğrulayın.
- **Narenciye sezonu:** Ekim-Mart arası narenciye ihracatı nedeniyle Mersin Limanı'nda reefer konteyner yoğunluğu artar. Bu dönemde standart konteynerler için de gate-in kuyrukları uzayabilir — en az 4-5 gün önceden planlama yapın.
- **İç bölge bağlantısı:** Mersin, İç Anadolu ve Güneydoğu Anadolu'nun ana ihracat kapısıdır. Karayolu ve demiryolu bağlantıları güçlüdür; transit süreleri hesaplamanıza dahil edin.
- **Mersin-Free Zone:** Mersin Serbest Bölgesi, limana 5 km mesafededir. Serbest bölgeden çıkacak konteynerler için gümrük sürelerini ayrıca planlayın.

<div class="cta-block">

**Mersin Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trmer)

</div>`,
    keyFeatures: [
      "Akdeniz Bölgesi'nin en büyük konteyner limanı",
      "MIP tarafından işletiliyor",
      "Yıllık 2.5 milyon+ TEU kapasite",
      "Demiryolu ve karayolu bağlantısı",
    ],
  },
  {
    code: "trist",
    name: "Aliağa Limanı",
    city: "İzmir",
    metaTitle:
      "Aliağa Limanı Ardiyesiz Giriş Hesaplama | İzmir Konteyner Limanı",
    metaDescription:
      "Aliağa (İzmir) Limanı için ardiyesiz giriş tarihi hesaplayın. Ege Bölgesi'nin en büyük konteyner limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Aliağa Limanı, İzmir'in kuzeyinde yer alan Ege Bölgesi'nin en büyük konteyner limanıdır. TCEGE ve Petkim konteyner terminalleriyle hizmet verir. Ardiyesiz giriş hesaplama aracımızla Aliağa limanları için en uygun gate-in tarihini hesaplayın.",
    content: `Aliağa Limanı, İzmir'in yaklaşık 50 km kuzeyinde, Ege Denizi kıyısında yer alan Ege Bölgesi'nin en büyük konteyner limanıdır.

## Aliağa Konteyner Terminalleri

- **TCEGE (Terminal Konteyner Ege):** Bölgenin ana konteyner terminali
- **Petkim Konteyner Terminali:** Petkim sahasında hizmet veren terminal

## Ardiyesiz Giriş Hesaplama

Aliağa limanları için ardiyesiz giriş hesaplaması yaparken:
- TCEGE ve Petkim terminallerinin güncel ardiye tarifelerini kullanın
- Ege Bölgesi çıkışlı gemiler için tipik serbest gün sayılarını kontrol edin
- Konteyner tipi ve IMO durumuna göre değişen tarifeleri dikkate alın

## Aliağa'da Operasyon İpuçları

- **Terminal farklılıkları:** TCEGE ve Petkim Konteyner Terminali farklı işletmeciler tarafından yönetilir. Ardiye tarifeleri ve serbest gün uygulamaları terminale göre değişir — hesaplama yaparken doğru terminali seçin.
- **Sanayi bölgesi avantajı:** Aliağa, İzmir'in sanayi bölgelerine (Aliağa OSB, Atatürk OSB) yakındır. Fabrika çıkışından liman girişine kadar olan kara yolu transit süresi genellikle 1-2 saattir.
- **Petkim bağlantısı:** Petkim terminali, kimya ve plastik sektörü ihracatçıları için özel elleçleme imkanları sunar. IMO yükler için ayrı tarife uygulanır.
- **Ege ihracat takvimi:** Ege Bölgesi'nde tarım ve gıda ihracatı ilkbahar-yaz aylarında yoğunlaşır. Bu dönemde konteyner ve gemi kapasitesini önceden teyit edin.

<div class="cta-block">

**Aliağa limanları için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trist)

</div>`,
    keyFeatures: [
      "Ege Bölgesi'nin en büyük konteyner limanı",
      "TCEGE ve Petkim terminalleri",
      "Sanayi bölgelerine yakın konum",
      "Karayolu ve demiryolu bağlantısı",
    ],
  },
  {
    code: "trgem",
    name: "Gemlik Limanı",
    city: "Bursa",
    metaTitle:
      "Gemlik Limanı Ardiyesiz Giriş Hesaplama | Bursa Konteyner Limanı",
    metaDescription:
      "Gemlik Limanı için ardiyesiz giriş tarihi hesaplayın. Marmara'nın güneyindeki önemli konteyner limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Gemlik Limanı, Bursa ilinde Marmara Denizi'nin güney kıyısında yer alan önemli bir konteyner limanıdır. Bursa otomotiv ve tekstil sanayisine yakınlığıyla stratejik öneme sahiptir. Ardiyesiz giriş hesaplama aracımızla Gemlik Limanı için en uygun gate-in tarihini hesaplayın.",
    content: `Gemlik Limanı, Marmara Denizi'nin güney kıyısında, Bursa il sınırları içinde yer alan stratejik bir konteyner limanıdır.

## Stratejik Konum

Gemlik Limanı, Bursa'nın güçlü sanayi altyapısına (otomotiv, tekstil, makine) yakınlığıyla öne çıkar. Gemlik-Bursa karayolu bağlantısı sayesinde hızlı lojistik imkanı sunar.

## Ardiyesiz Giriş Hesaplama

Gemlik Limanı için ardiyesiz giriş hesaplaması yaparken:
- Gemlik liman işletmesinin güncel ardiye tarifesini kullanın
- Marmara Denizi çıkışlı gemiler için tipik serbest gün uygulamalarını kontrol edin
- Bursa sanayisinin yoğun sevkiyat dönemlerini dikkate alın

## Gemlik'te Operasyon İpuçları

- **Bursa sanayi koridoru:** Gemlik, Bursa'nın otomotiv (TOFAŞ, Oyak Renault), tekstil ve makine sanayisine doğrudan karayolu bağlantısına sahiptir. Fabrika-liman arası transit süresi ortalama 45 dakikadır.
- **Otomotiv sevkiyat dönemleri:** Otomotiv ihracatının yoğun olduğu Mart-Haziran ve Eylül-Kasım dönemlerinde liman kapasitesi zorlanabilir. Konteyner rezervasyonunuzu en az 2 hafta önceden yapın.
- **Ro-Ro bağlantısı:** Gemlik'ten Ro-Ro seferleri de mevcuttur. Konteyner yükünüz Ro-Ro'ya uygunsa maliyet avantajı sağlayabilirsiniz.
- **Marmara deniz trafiği:** İstanbul Boğazı'ndaki gecikmeler Gemlik çıkışlı gemilerin programını etkileyebilir. Gemi gecikmelerine karşı esnek gate-in planlaması yapın.

<div class="cta-block">

**Gemlik Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trgem)

</div>`,
    keyFeatures: [
      "Bursa sanayi bölgelerine yakın stratejik konum",
      "Marmara'nın güneyinde ana konteyner limanı",
      "Otomotiv ve tekstil ihracatı için ideal",
      "Güçlü karayolu bağlantısı",
    ],
  },
  {
    code: "trtek",
    name: "Asyaport Limanı",
    city: "Tekirdağ",
    metaTitle:
      "Asyaport Limanı Ardiyesiz Giriş Hesaplama | Tekirdağ Konteyner Limanı",
    metaDescription:
      "Asyaport (Tekirdağ) Limanı için ardiyesiz giriş tarihi hesaplayın. Türkiye'nin en büyük transshipment limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Asyaport, Tekirdağ'da yer alan Türkiye'nin ilk ve en büyük transshipment (aktarma) konteyner limanıdır. Modern altyapısı ve yüksek kapasitesiyle hizmet verir. Ardiyesiz giriş hesaplama aracımızla Asyaport için en uygun gate-in tarihini hesaplayın.",
    content: `Asyaport Limanı, Tekirdağ'ın Barbaros beldesinde yer alan Türkiye'nin ilk ve en büyük transshipment (aktarma) konteyner limanıdır.

## Transshipment Özellikleri

Asyaport, ana limanlar arasında aktarma (hub) olarak tasarlanmıştır. 2.000 metre rıhtım uzunluğu ve 18 metre su derinliği ile mega gemilere hizmet verebilmektedir.

## Ardiyesiz Giriş Hesaplama

Asyaport için ardiyesiz giriş hesaplaması yaparken:
- Transshipment konteynerler için farklı tarife uygulamalarını kontrol edin
- Asyaport'un güncel ardiye tarifesini kullanın
- Mega gemi sefer programlarına göre serbest gün değişikliklerini takip edin

## Asyaport'ta Operasyon İpuçları

- **Transshipment avantajı:** Asyaport, aktarma konteynerler için tasarlanmıştır. İhracat konteyneriniz bir ana liman üzerinden aktarılacaksa, Asyaport'ta bekleme süreleri diğer limanlara göre daha kısa olabilir.
- **Mega gemi programları:** 18 metre su derinliği sayesinde 18.000+ TEU kapasiteli mega gemiler yanaşabilir. Ana hatların mega gemi sefer programlarını takip ederek gate-in zamanlamanızı optimize edin.
- **İstanbul'a yakınlık:** Asyaport, İstanbul'a karayoluyla yaklaşık 2 saat mesafededir. Marmara Bölgesi'ndeki ihracatçılar için Ambarlı'ya alternatif olarak değerlendirilebilir.
- **Yeni liman dinamikleri:** Asyaport görece yeni bir liman olduğu için ardiye tarifeleri rekabetçi olabilir. Güncel tarifeyi Asyaport işletmesinden teyit edin.

<div class="cta-block">

**Asyaport için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trtek)

</div>`,
    keyFeatures: [
      "Türkiye'nin en büyük transshipment limanı",
      "2.000 m rıhtım, 18 m su derinliği",
      "Mega gemilere uygun altyapı",
      "İstanbul'a 2 saat mesafe",
    ],
  },
  {
    code: "trdrk",
    name: "Derince Limanı",
    city: "Kocaeli",
    metaTitle:
      "Derince Limanı Ardiyesiz Giriş Hesaplama | Kocaeli Konteyner Limanı",
    metaDescription:
      "Derince Limanı için ardiyesiz giriş tarihi hesaplayın. Kocaeli'ndeki önemli konteyner limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Derince Limanı, Kocaeli'nde İzmit Körfezi kıyısında yer alan konteyner limanıdır. Safiport'un da bulunduğu bölgede sanayi lojistiğine hizmet verir.",
    content: `Derince Limanı, Kocaeli ilinde İzmit Körfezi'nin kuzey kıyısında yer alan önemli bir konteyner limanıdır.

## Sanayi Bağlantısı

Kocaeli ve çevresindeki yoğun sanayi bölgelerine yakınlığıyla öne çıkar. Otomotiv, kimya ve metal sanayisi için kritik lojistik noktasıdır.

## Ardiyesiz Giriş Hesaplama

Derince Limanı için ardiyesiz giriş hesaplaması yaparken:
- Derince liman işletmesinin güncel ardiye tarifesini kullanın
- İzmit Körfezi çıkışlı gemiler için tipik serbest günleri kontrol edin
- Bölgesel sanayi yoğunluğuna göre planlama yapın

## Derince'de Operasyon İpuçları

- **Safiport alternatifi:** Derince'de Safiport'un devreye girmesiyle bölgede rekabet arttı. Her iki terminalin güncel ardiye tarifelerini karşılaştırarak en avantajlı seçeneği belirleyin.
- **Kocaeli sanayi lojistiği:** Derince, Kocaeli'ndeki otomotiv (Ford Otosan, Honda), kimya ve metal sanayisi için kritik çıkış noktasıdır. Fabrika-liman arası kısa mesafe sayesinde son gün yükleme esnekliği sağlar.
- **İzmit Körfezi seyir kısıtları:** Körfez içindeki gemi trafiği ve demirleme düzenlemeleri sefer programlarını etkileyebilir. Gemi acentenizden güncel programı teyit edin.
- **Depolama alanı:** Derince'deki konteyner sahaları görece sınırlıdır. Yoğun dönemlerde erken gate-in yaparak yer garantileyin.

<div class="cta-block">

**Derince Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trdrk)

</div>`,
    keyFeatures: [
      "Kocaeli sanayi bölgelerine yakın konum",
      "İzmit Körfezi'nde stratejik nokta",
      "Otomotiv ve kimya sektörü lojistiği",
      "Güçlü karayolu ve demiryolu bağlantısı",
    ],
  },
  {
    code: "trals",
    name: "Alsancak Limanı",
    city: "İzmir",
    metaTitle:
      "Alsancak Limanı Ardiyesiz Giriş Hesaplama | İzmir Konteyner Limanı",
    metaDescription:
      "Alsancak (İzmir) Limanı için ardiyesiz giriş tarihi hesaplayın. Ege'nin ana konteyner limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Alsancak Limanı, İzmir'in merkezinde yer alan Ege Bölgesi'nin ana konteyner limanıdır. TCDD İzmir Liman İşletmesi tarafından işletilir. Ardiyesiz giriş hesaplama aracımızla Alsancak Limanı için en uygun gate-in tarihini hesaplayın.",
    content: `Alsancak Limanı, İzmir şehir merkezinde yer alan Ege Bölgesi'nin en köklü konteyner limanıdır.

## Stratejik Konum

Alsancak Limanı, İzmir'in merkezi konumu sayesinde Ege Bölgesi'nin ihracat yükünün ana çıkış kapısıdır. TCDD demiryolu ağına doğrudan bağlantısı ile iç bölgelere kesintisiz intermodal taşıma imkanı sunar.

## Ardiyesiz Giriş Hesaplama

Alsancak Limanı için ardiyesiz giriş hesaplaması yaparken:
- TCDD İzmir Liman İşletmesi'nin güncel ardiye tarifesini kullanın
- Ege Bölgesi çıkışlı gemiler için tipik serbest gün uygulamalarını kontrol edin
- Limanın şehir merkezinde olması nedeniyle karayolu erişiminde olası trafik gecikmelerini hesaba katın

## Alsancak'ta Operasyon İpuçları

- **Demiryolu bağlantısı:** Alsancak, TCDD ana hat demiryolu ağına doğrudan bağlıdır. İç Anadolu'dan gelen yükler için karayoluna göre daha öngörülebilir transit süresi sunar.
- **Şehir içi konum:** Limanın İzmir şehir merkezinde yer alması, özellikle iş çıkış saatlerinde (17:00-19:00) karayolu erişimini zorlaştırabilir. Gate-in planlamanızı trafik saatlerini dikkate alarak yapın.
- **Ege tarım ihracatı:** İlkbahar ve yaz aylarında Ege'nin tarım ve gıda ihracatı yoğunlaşır. Bu dönemde konteyner ve gemi rezervasyonunuzu önceden yapın.
- **Aliağa ile karşılaştırma:** Alsancak ve Aliağa limanları arasında ardiye tarifesi ve serbest gün farklılıkları olabilir. Her iki limanı karşılaştırarak en avantajlı çıkış noktasını seçin.

<div class="cta-block">

**Alsancak Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trals)

</div>`,
    keyFeatures: [
      "Ege Bölgesi'nin ana konteyner limanı",
      "TCDD demiryolu ağına doğrudan bağlantı",
      "İzmir şehir merkezinde stratejik konum",
      "İç bölgelere intermodal taşıma imkanı",
    ],
  },
  {
    code: "trisk",
    name: "İskenderun Limanı",
    city: "Hatay",
    metaTitle:
      "İskenderun Limanı Ardiyesiz Giriş Hesaplama | Hatay Konteyner Limanı",
    metaDescription:
      "İskenderun Limanı için ardiyesiz giriş tarihi hesaplayın. Güneydoğu Anadolu'nun ana konteyner çıkış kapısında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "İskenderun Limanı, Hatay'da Doğu Akdeniz kıyısında yer alan, Güneydoğu Anadolu Bölgesi ve GAP koridorunun ana deniz çıkış kapısıdır. Ardiyesiz giriş hesaplama aracımızla İskenderun Limanı için en uygun gate-in tarihini hesaplayın.",
    content: `İskenderun Limanı, Hatay ilinde Doğu Akdeniz kıyısında yer alan, Güneydoğu Anadolu Bölgesi'nin en önemli deniz çıkış kapısıdır.

## Stratejik Konum

İskenderun, GAP (Güneydoğu Anadolu Projesi) koridorunun ana limanıdır. Demir-çelik, çimento, hububat ve konteyner yükleri için kritik bir lojistik merkezdir.

## Ardiyesiz Giriş Hesaplama

İskenderun Limanı için ardiyesiz giriş hesaplaması yaparken:
- Liman işletmesinin güncel ardiye tarifesini kullanın
- Doğu Akdeniz çıkışlı konteyner hatlarının serbest gün uygulamalarını kontrol edin
- Bölgedeki sanayi yüklerinin mevsimsel yoğunluğunu dikkate alın

## İskenderun'da Operasyon İpuçları

- **GAP koridoru:** İskenderun, GAP bölgesindeki tarım ve sanayi ürünlerinin ana çıkış kapısıdır. Güneydoğu illerinden gelen yükler için transit süreleri önceden planlayın.
- **Demir-çelik sektörü:** İskenderun, Türkiye'nin en büyük demir-çelik üretim merkezlerinden biridir. Bu sektörün sevkiyat yoğunluğu konteyner kapasitesini etkileyebilir.
- **Orta Doğu bağlantısı:** İskenderun, Orta Doğu ve Körfez ülkelerine yapılan ihracatta stratejik avantaj sağlar. Transit süreler diğer Türk limanlarına göre daha kısadır.
- **Sınır kapısı yakınlığı:** Cilvegözü ve Öncüpınar sınır kapılarına yakınlık, Suriye ve Irak'a re-export yükler için İskenderun'u cazip kılar.

<div class="cta-block">

**İskenderun Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trisk)

</div>`,
    keyFeatures: [
      "GAP koridorunun ana deniz çıkış kapısı",
      "Demir-çelik ve sanayi yüklerinde uzmanlaşmış",
      "Orta Doğu pazarlarına kısa transit süresi",
      "Demiryolu ve karayolu bağlantısı",
    ],
  },
  {
    code: "trsam",
    name: "Samsun Limanı",
    city: "Samsun",
    metaTitle:
      "Samsun Limanı Ardiyesiz Giriş Hesaplama | Karadeniz Konteyner Limanı",
    metaDescription:
      "Samsun Limanı için ardiyesiz giriş tarihi hesaplayın. Karadeniz Bölgesi'nin ana konteyner limanında ardiye ücretleri ve serbest günler.",
    seoDescription:
      "Samsun Limanı, Karadeniz Bölgesi'nin en büyük ve en işlek limanıdır. Karadeniz'e kıyısı olan illerin ihracat ve ithalat yüküne hizmet verir. Ardiyesiz giriş hesaplama aracımızla Samsun Limanı için en uygun gate-in tarihini hesaplayın.",
    content: `Samsun Limanı, Karadeniz kıyısında yer alan, Karadeniz Bölgesi'nin en büyük ve en işlek konteyner limanıdır.

## Stratejik Konum

Samsun, Karadeniz Bölgesi'nin lojistik merkezidir. Demiryolu bağlantısı sayesinde İç Anadolu'ya açılan kapı konumundadır. Samsun-Sivas demiryolu hattı, limanın hinterlandını genişletir.

## Ardiyesiz Giriş Hesaplama

Samsun Limanı için ardiyesiz giriş hesaplaması yaparken:
- Samsun Liman İşletmesi'nin güncel ardiye tarifesini kullanın
- Karadeniz çıkışlı feeder gemilerin serbest gün uygulamalarını kontrol edin
- Mevsimsel hava koşullarının gemi programlarına etkisini dikkate alın

## Samsun'da Operasyon İpuçları

- **Feeder ağı:** Samsun'dan çıkan konteynerler genellikle Ambarlı veya İzmir üzerinden ana gemiye aktarılır. Feeder gemi programlarını ana gemi ETD'si ile uyumlu planlayın.
- **Karadeniz hava koşulları:** Kış aylarında (Kasım-Şubat) Karadeniz'deki olumsuz hava koşulları gemi programlarını aksatabilir. Bu dönemde gate-in planlamanıza ek marj koyun.
- **Demiryolu avantajı:** Samsun-Sivas-Kalın demiryolu hattı, İç Anadolu ve Doğu Anadolu'dan gelen yükler için maliyet avantajı sağlar. Karayoluna göre daha öngörülebilir transit süreleri sunar.
- **Rusya ve BDT bağlantısı:** Samsun, Rusya ve BDT ülkelerine Ro-Ro ve konteyner seferleri için önemli bir kalkış noktasıdır.

<div class="cta-block">

**Samsun Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trsam)

</div>`,
    keyFeatures: [
      "Karadeniz Bölgesi'nin en büyük limanı",
      "Samsun-Sivas demiryolu bağlantısı",
      "Rusya ve BDT ülkelerine Ro-Ro seferleri",
      "İç Anadolu'ya açılan lojistik kapı",
    ],
  },
  {
    code: "trhay",
    name: "Haydarpaşa Limanı",
    city: "İstanbul",
    metaTitle:
      "Haydarpaşa Limanı Ardiyesiz Giriş Hesaplama | İstanbul Tarihi Liman",
    metaDescription:
      "Haydarpaşa Limanı için ardiyesiz giriş tarihi hesaplayın. İstanbul'un tarihi limanında güncel ardiye ücretleri, Ro-Ro ve konteyner operasyonları.",
    seoDescription:
      "Haydarpaşa Limanı, İstanbul'un Anadolu yakasında, Boğaz girişinde yer alan Türkiye'nin en köklü limanıdır. Günümüzde Ro-Ro ve konteyner operasyonları ile hizmet vermeye devam etmektedir.",
    content: `Haydarpaşa Limanı, İstanbul Boğazı'nın Anadolu yakası girişinde yer alan Türkiye'nin en köklü liman tesisidir.

## Tarihi ve Güncel Durum

Haydarpaşa Limanı, 1899 yılında inşa edilmeye başlanmış, 1903'te hizmete girmiştir. Tarihi Haydarpaşa Garı'nın hemen yanında yer alır. Günümüzde ağırlıklı olarak Ro-Ro ve konteyner operasyonları gerçekleştirilmektedir.

## Ardiyesiz Giriş Hesaplama

Haydarpaşa Limanı için ardiyesiz giriş hesaplaması yaparken:
- TCDD Haydarpaşa Liman İşletmesi'nin güncel ardiye tarifesini kullanın
- Ro-Ro ve konteyner operasyonları için farklı serbest gün uygulamalarını kontrol edin
- Limanın güncel kapasite ve operasyon durumunu teyit edin

## Haydarpaşa'da Operasyon İpuçları

- **Ro-Ro ağırlıklı:** Haydarpaşa günümüzde Ro-Ro taşımacılığında aktif rol oynar. Konteyner yükünüz Ro-Ro'ya uygunsa maliyet avantajı değerlendirilebilir.
- **Demiryolu entegrasyonu:** Tarihi Haydarpaşa Garı ile yan yana olması, demiryolu-konteyner intermodal operasyonları için benzersiz bir avantaj sağlar.
- **İstanbul trafiğine dikkat:** Liman, İstanbul'un en yoğun bölgelerinden birinde (Kadıköy-Üsküdar arası) yer alır. Karayolu erişimi için trafik yoğunluğunu hesaba katın — özellikle 07:00-10:00 ve 16:00-20:00 saatleri arası.
- **Kapasite kısıtı:** Haydarpaşa'nın konteyner elleçleme kapasitesi Ambarlı'ya göre sınırlıdır. Yüksek hacimli sevkiyatlar için Ambarlı veya Derince'yi alternatif olarak değerlendirin.

<div class="cta-block">

**Haydarpaşa Limanı için ardiyesiz giriş tarihinizi hemen hesaplayın.**

[Masrafınızı Hesaplayın →](/hesaplama?liman=trhay)

</div>`,
    keyFeatures: [
      "Türkiye'nin en köklü limanı (1903)",
      "Ro-Ro ve konteyner operasyonları",
      "Demiryolu entegrasyonu",
      "İstanbul Boğazı girişinde stratejik konum",
    ],
  },
]
