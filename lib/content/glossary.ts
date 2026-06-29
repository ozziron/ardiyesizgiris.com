/**
 * SEO Glossary — Lojistik ve konteyner taşımacılığı terimleri sözlüğü.
 *
 * Growth ekibi yeni terimler ekleyebilir, mevcut açıklamaları
 * güncelleyebilir. Her terim `slug`, `title`, `description` (meta),
 * `definition` (içerik) ve `relatedTerms` alanlarını içerir.
 *
 * YENİ TERİM EKLEMEK İÇİN: Dizinin sonuna yeni bir obje ekleyin.
 * `slug` benzersiz olmalı, URL'de kullanılacak (örn: /sozluk/ardiye).
 */

export interface GlossaryTerm {
  slug: string
  title: string
  description: string
  definition: string
  relatedTerms: string[]
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "ardiyesiz-giris",
    title: "Ardiyesiz Giriş",
    description:
      "Ardiyesiz giriş nedir? Konteyner taşımacılığında ardiyesiz giriş tarihi nasıl hesaplanır?",
    definition: `Ardiyesiz giriş, bir konteynerin liman sahasına **ardiye (depolama) ücreti ödemeden** girebileceği son tarihi ifade eder.

Konteyner taşımacılığında, ihracat konteynerleri limana belirli bir süre öncesinden giriş yapabilir. Bu süre **serbest günler** olarak adlandırılır ve gemi acentesi veya hat tarafından belirlenir.

Serbest günler içinde konteyner limana giriş yaparsa **ardiye ücreti ödenmez**. Serbest günler aşıldığında ise günlük ardiye ücreti tahakkuk etmeye başlar.

Ardiyesiz giriş hesaplaması şu faktörlere bağlıdır:
- Limanın ardiye tarifesi
- Konteyner tipi (20', 40', HC vb.)
- Armatör/hata ait serbest gün sayısı
- IMO (tehlikeli madde) durumu`,
    relatedTerms: ["ardiye", "serbest-gun", "demuraj"],
  },
  {
    slug: "ardiye",
    title: "Ardiye",
    description:
      "Ardiye nedir? Liman ardiye ücretleri nasıl hesaplanır? Ardiye masrafları hakkında detaylı bilgi.",
    definition: `**Ardiye**, liman işletmesinin konteynerleri liman sahasında depolaması karşılığında tahsil ettiği **günlük depolama ücretidir**.

Ardiye ücreti, konteynerin limana giriş yaptığı tarihten itibaren işlemeye başlar. Armatör veya gemi acentesi tarafından tanınan **serbest günler** dolduktan sonra günlük olarak tahakkuk eder.

Ardiye ücretleri genellikle **kademeli (tiered)** olarak uygulanır:
- **1. Kademe (Tier 1):** İlk birkaç gün, görece düşük ücret
- **2. Kademe (Tier 2):** Orta vadeli bekleme, artan ücret
- **3. Kademe (Tier 3):** Uzun süreli bekleme, en yüksek ücret

Bu kademeli yapı, konteynerlerin limanda gereksiz bekletilmesini caydırmak için tasarlanmıştır.`,
    relatedTerms: ["ardiyesiz-giris", "serbest-gun", "demuraj", "detention"],
  },
  {
    slug: "demuraj",
    title: "Demuraj (Demurrage)",
    description:
      "Demuraj nedir? Konteyner demuraj ücreti nasıl hesaplanır? Demurrage ve detention farkı.",
    definition: `**Demuraj (Demurrage)**, ithal konteynerlerin limandan tahliyesinden sonra belirli bir süre içinde boş olarak iade edilmemesi durumunda armatör tarafından tahsil edilen **gecikme ücretidir**.

Demuraj, konteynerin gemi sahibine ait olduğu ve liman/terminal sahasında beklediği süre için uygulanır. Armatörler genellikle ithalat tarafında **5-7 gün** serbest süre tanır.

**Demuraj ve Detention Farkı:**
- **Demuraj:** Konteyner liman/terminal sahasında beklerken uygulanır
- **Detention:** Konteyner liman dışında, ithalatçının deposunda beklerken uygulanır

Her ikisi de armatör ekipmanının atıl kalmasından kaynaklanan maliyetin karşılanması amacıyla tahsil edilir.`,
    relatedTerms: ["ardiye", "detention", "serbest-gun"],
  },
  {
    slug: "detention",
    title: "Detention",
    description:
      "Detention nedir? Konteyner detention ücreti nasıl hesaplanır? Detention ve demurrage arasındaki farklar.",
    definition: `**Detention**, konteynerin liman/terminal sahasından çıkış yaptıktan sonra, belirlenen süre içinde boş olarak iade edilmemesi durumunda armatör tarafından tahsil edilen **ekipman kullanım ücretidir**.

Detention süresi, konteynerin liman kapısından çıktığı andan itibaren başlar. İthalatçıya genellikle **7-14 gün** arası serbest detention süresi tanınır.

**Önemli noktalar:**
- Demuraj ve detention genellikle **birleşik (combined)** olarak da uygulanabilir
- Armatöre ve limana göre değişen farklı tarifeler uygulanır
- Konteyner tipi (20', 40', HC, Reefer) detention ücretini etkiler`,
    relatedTerms: ["demuraj", "ardiye", "konteyner"],
  },
  {
    slug: "serbest-gun",
    title: "Serbest Gün (Free Days)",
    description:
      "Serbest gün (free days) nedir? Konteyner taşımacılığında serbest gün sayısı nasıl belirlenir?",
    definition: `**Serbest gün (Free Days)**, armatör veya gemi acentesi tarafından konteyner için tanınan **ücretsiz bekleme süresidir**.

Serbest günler iki farklı bağlamda kullanılır:

1. **İhracat (Export) Serbest Günleri:** Konteynerin limana erken giriş yapabileceği, ardiye ücreti ödemeden bekleyebileceği gün sayısı. Genellikle **7-10 gün** arasındadır.

2. **İthalat (Import) Serbest Günleri:** Konteynerin limandan tahliyesinden sonra demuraja girmeden önceki bekleme süresi. Genellikle **5-7 gün** arasındadır.

Serbest gün sayısı:
- Armatör/hata göre değişir
- Konteyner tipine göre farklılık gösterebilir
- Liman yoğunluğuna bağlı olarak değişebilir
- Müşteri sözleşmesine göre özel olarak belirlenebilir`,
    relatedTerms: ["ardiyesiz-giris", "ardiye", "demuraj"],
  },
  {
    slug: "konteyner",
    title: "Konteyner (Container)",
    description:
      "Konteyner tipleri nelerdir? 20', 40', High Cube ve diğer konteyner çeşitleri hakkında bilgi.",
    definition: `**Konteyner**, uluslararası taşımacılıkta kullanılan standart boyutlu taşıma birimidir. ISO standartlarına göre üretilir ve gemiden trene, TIR'dan limana kesintisiz taşınabilir.

**Yaygın konteyner tipleri:**
- **20' DC (Dry Container):** 20 feet, standart kuru yük konteyneri (~33 m³)
- **40' DC (Dry Container):** 40 feet, standart kuru yük konteyneri (~67 m³)
- **40' HC (High Cube):** 40 feet, ekstra yükseklik (~76 m³)
- **40' Reefer:** Soğutmalı (refrigerated) konteyner
- **20' OT (Open Top):** Üstü açık konteyner
- **40' OT (Open Top):** 40 feet üstü açık konteyner
- **20' FR (Flat Rack):** Düz platform konteyner

Konteyner tipi, ardiye ve demuraj ücretlerini doğrudan etkiler. Genellikle 40' konteynerler 20' konteynerlere göre daha yüksek ardiye ücretine tabidir.`,
    relatedTerms: ["ardiye", "demuraj", "serbest-gun"],
  },
  {
    slug: "konsimento",
    title: "Konşimento (Bill of Lading)",
    description:
      "Konşimento (B/L) nedir? Konteyner taşımacılığında konşimento türleri ve önemi.",
    definition: `**Konşimento (Bill of Lading - B/L)**, taşıyan tarafından yükletene verilen, yükün teslim alındığını ve taşınacağını gösteren **kıymetli evraktır**.

Konşimento üç temel işlevi yerine getirir:
1. **Taşıma sözleşmesidir:** Taşıma şartlarını belirler
2. **Makbuzdur:** Yükün teslim alındığını kanıtlar
3. **Mülkiyet belgesidir:** Konşimentoyu elinde bulunduran yük üzerinde hak sahibidir

**Konşimento türleri:**
- **Orijinal B/L:** Ciro edilebilir, fiziksel teslim gerektirir
- **Sea Waybill:** Ciro edilemez, fiziksel teslim gerekmez
- **Telex Release:** Orijinal B/L'nin elektronik olarak iptal edilmesi
- **Express B/L:** Hızlı teslimat için kullanılan özel konşimento

İhracat ardiyesiz giriş hesaplamalarında konşimento tarihi (B/L date) önemli bir referans noktasıdır.`,
    relatedTerms: ["konteyner", "liman"],
  },
  {
    slug: "liman",
    title: "Liman (Port)",
    description:
      "Türkiye limanları: Ambarlı, Mersin, İzmir, Gemlik ve diğer büyük konteyner limanları hakkında bilgi.",
    definition: `**Liman**, gemilerin yük indirme-bindirme yaptığı, gümrük işlemlerinin gerçekleştirildiği **deniz ticaret merkezidir**.

Türkiye'nin başlıca konteyner limanları:
- **Ambarlı (İstanbul):** Marmara Bölgesi'nin en büyük konteyner liman kompleksi (Kumport, Marport, Mardaş)
- **Mersin (Mersin):** Akdeniz Bölgesi'nin ana konteyner limanı
- **Aliağa (İzmir):** Ege Bölgesi'nin en büyük konteyner limanı
- **Gemlik (Bursa):** Marmara'nın güneyinde önemli liman
- **Asyaport (Tekirdağ):** Türkiye'nin en büyük transshipment limanı
- **Derince (Kocaeli):** Marmara'nın doğusunda konteyner limanı
- **Haydarpaşa (İstanbul):** Tarihi liman, günümüzde sınırlı konteyner operasyonu

Her limanın kendine özel **ardiye tarifesi** ve **serbest gün uygulamaları** bulunur. Ardiyesiz giriş hesaplaması limana göre değişiklik gösterir.`,
    relatedTerms: ["ardiye", "ardiyesiz-giris", "konteyner"],
  },
  {
    slug: "imo",
    title: "IMO (Tehlikeli Madde)",
    description:
      "IMO (International Maritime Organization) tehlikeli madde sınıflandırması ve konteyner taşımacılığında IMO yükler.",
    definition: `**IMO (International Maritime Organization)**, tehlikeli maddelerin deniz yoluyla taşınmasına ilişkin uluslararası standartları belirleyen kuruluştur.

**IMO Sınıfları:**
- Sınıf 1: Patlayıcılar
- Sınıf 2: Gazlar
- Sınıf 3: Yanıcı sıvılar
- Sınıf 4: Yanıcı katılar
- Sınıf 5: Oksitleyici maddeler
- Sınıf 6: Zehirli maddeler
- Sınıf 7: Radyoaktif maddeler
- Sınıf 8: Aşındırıcı maddeler
- Sınıf 9: Diğer tehlikeli maddeler

IMO yük taşıyan konteynerler için **ardiye ücretleri genellikle daha yüksektir** ve farklı serbest gün uygulamaları söz konusu olabilir. Bazı limanlar IMO yükler için özel tarifeler uygular.`,
    relatedTerms: ["konteyner", "ardiye", "liman"],
  },
  {
    slug: "gumruk",
    title: "Gümrük (Customs)",
    description:
      "Gümrük işlemleri ve konteyner taşımacılığında gümrük süreçleri hakkında bilgi.",
    definition: `**Gümrük**, bir ülkeye giren veya ülkeden çıkan eşyanın kontrol edildiği, vergilendirildiği ve kayıt altına alındığı **resmi denetim noktasıdır**.

İhracat konteynerleri için gümrük süreci:
1. Gümrük beyannamesi (GB) tescil edilir
2. Konteyner limana giriş yapar
3. Gümrük muayenesi (varsa) yapılır
4. Gümrük çıkış onayı verilir
5. Konteyner gemiye yüklenir

Gümrük işlemleri, **ardiyesiz giriş hesaplamasında** kritik bir zamanlama faktörüdür. Gümrük onayı alınmadan konteyner gemiye yüklenemez; bu nedenle konteynerin limana giriş zamanlaması gümrük süreciyle uyumlu olmalıdır.`,
    relatedTerms: ["liman", "konteyner", "konsimento"],
  },
  {
    slug: "gate-in",
    title: "Gate-In",
    description:
      "Gate-In nedir? Konteyner liman giriş işlemi nasıl yapılır? Gate-In'in ardiyesiz giriş hesaplamasındaki önemi.",
    definition: `**Gate-In**, bir konteynerin liman sahasına resmi olarak giriş yaptığı anı ifade eden lojistik terimdir.

Gate-In işlemi sırasında:
1. Konteyner liman kapısından giriş yapar
2. Konteyner numarası ve mühür kontrolü yapılır
3. Konteyner hasar tespiti gerçekleştirilir
4. Konteyner, gemi yükleme sahasına (CY) alınır

**Gate-In'in ardiyesiz giriş hesaplamasındaki önemi:**
- Ardiye süresi, Gate-In tarihinden itibaren işlemeye başlar
- Serbest günler Gate-In tarihi esas alınarak hesaplanır
- Gate-In tarihi ile gemi ETD'si arasındaki gün farkı = toplam bekleme süresi
- Bekleme süresi > serbest gün ise ardiye ücreti tahakkuk eder

Doğru Gate-In zamanlaması, ardiye maliyetlerini minimize etmenin en kritik adımıdır.`,
    relatedTerms: ["ardiyesiz-giris", "ardiye", "gate-out", "serbest-gun"],
  },
  {
    slug: "gate-out",
    title: "Gate-Out",
    description:
      "Gate-Out nedir? Konteyner liman çıkış işlemi nasıl yapılır? Gate-Out ve detention ilişkisi.",
    definition: `**Gate-Out**, bir konteynerin liman sahasından resmi olarak çıkış yaptığı anı ifade eden lojistik terimdir.

Gate-Out işlemi:
1. İthalatçı veya forwarder konteyneri teslim alır
2. Liman çıkış evrakları kontrol edilir
3. Konteyner liman kapısından çıkış yapar
4. Çıkış kaydı terminal işletim sistemine işlenir

**Gate-Out ve Detention İlişkisi:**
- Detention süresi, Gate-Out tarihinden itibaren başlar
- Konteynerin Gate-Out'tan sonra boş olarak iade edilmesi gerekir
- İade süresi detention serbest günlerini aşarsa detention ücreti tahakkuk eder
- Gate-Out tarihi, demuraj ve detention arasındaki sınırı belirler`,
    relatedTerms: ["gate-in", "detention", "demuraj", "ardiye"],
  },
  {
    slug: "etd-eta",
    title: "ETD ve ETA",
    description:
      "ETD ve ETA nedir? Tahmini kalkış ve varış zamanı. Konteyner taşımacılığında ETD ve ETA'nın önemi.",
    definition: `**ETD (Estimated Time of Departure)**, geminin limandan tahmini kalkış zamanını; **ETA (Estimated Time of Arrival)**, geminin varış limanına tahmini varış zamanını ifade eder.

**ETD (Tahmini Kalkış):**
- Konteyner ihracat operasyonlarında planlamanın merkezinde ETD yer alır
- Gate-In son tarihi, ETD'den geriye doğru hesaplanır
- Gümrük işlemleri ETD'den önce tamamlanmış olmalıdır
- ETD değişiklikleri (delay) ardiye maliyetlerini doğrudan etkiler

**ETA (Tahmini Varış):**
- İthalat operasyonlarında konteynerin ne zaman limana ulaşacağını belirtir
- Gümrükleme ve dahiliye nakliyesi planlaması ETA'ya göre yapılır
- ETA gecikmeleri tedarik zincirinde domino etkisi yaratabilir

**Operasyonel İpucu:** ETD değişikliklerini yakından takip edin. Geminin 2-3 gün gecikmesi, konteyner başına yüzlerce dolar ek ardiye maliyeti doğurabilir.`,
    relatedTerms: ["gate-in", "gate-out", "ardiye", "konsimento"],
  },
  {
    slug: "konteyner-terminali",
    title: "Konteyner Terminali",
    description:
      "Konteyner terminali nedir? Türkiye'deki başlıca konteyner terminalleri ve terminal operasyonları hakkında bilgi.",
    definition: `**Konteyner terminali**, liman bünyesinde konteynerlerin elleçlendiği, depolandığı ve gemiye yüklendiği/boşaltıldığı **özel ekipmanlı tesistir**.

Bir konteyner terminalinde bulunan ana ekipman ve alanlar:
- **Rıhtım (Berth):** Geminin yanaştığı alan
- **SSG / RTG:** Konteyner istifleme vinçleri (Straddle Carrier, Rubber Tyred Gantry)
- **CY (Container Yard):** Konteyner depolama sahası
- **CFS (Container Freight Station):** Konteyner içi yük elleçleme alanı
- **Gate:** Konteyner giriş-çıkış kontrol noktası

**Türkiye'deki başlıca konteyner terminalleri:**
- **Ambarlı:** Kumport, Marport, Mardaş
- **Mersin:** MIP (Mersin International Port)
- **Aliağa:** TCEGE, Petkim
- **Gemlik:** Gemlik Limanı
- **Asyaport:** Türkiye'nin en büyük transshipment terminali
- **Derince:** Safiport ve Derince Limanı

Her terminalin kendine özel ardiye tarifesi ve serbest gün uygulamaları vardır. Ardiyesiz giriş hesaplaması terminal bazında yapılmalıdır.`,
    relatedTerms: ["liman", "ardiye", "gate-in", "konteyner"],
  },
]
