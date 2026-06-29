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

> **💡 Büyüme Ekibi:** Bu bölüme Ambarlı limanına özel avantajlar, bölgesel operasyon ipuçları ve CTA metinleri eklenebilir.`,
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

> **💡 Büyüme Ekibi:** Bu bölüme Mersin limanına özel operasyonel ipuçları, mevsimsel yoğunluk bilgileri ve CTA metinleri eklenebilir.`,
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

> **💡 Büyüme Ekibi:** Bu bölüme Aliağa limanına özel operasyonel ipuçları, bölgesel avantajlar ve CTA metinleri eklenebilir.`,
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

> **💡 Büyüme Ekibi:** Bu bölüme Gemlik limanına özel operasyonel ipuçları, Bursa sanayi bağlantıları ve CTA metinleri eklenebilir.`,
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

> **💡 Büyüme Ekibi:** Bu bölüme Asyaport'a özel avantajlar, transshipment operasyon ipuçları ve CTA metinleri eklenebilir.`,
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

> **💡 Büyüme Ekibi:** Bu bölüme Derince limanına özel içerik, bölgesel sanayi bağlantıları ve CTA metinleri eklenebilir.`,
    keyFeatures: [
      "Kocaeli sanayi bölgelerine yakın konum",
      "İzmit Körfezi'nde stratejik nokta",
      "Otomotiv ve kimya sektörü lojistiği",
      "Güçlü karayolu ve demiryolu bağlantısı",
    ],
  },
]
