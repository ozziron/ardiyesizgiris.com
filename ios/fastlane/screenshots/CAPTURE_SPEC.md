# App Store Connect — Ekran Görüntüsü Capture Spec

**Hazırlayan:** UXDesigner  
**Son güncelleme:** 2026-06-29  
**Parent issue:** [ARDA-57](/ARDA/issues/ARDA-57)  
**Bloke eden:** [ARDA-49](/ARDA/issues/ARDA-49) — iOS build + TestFlight CI (Apple Developer Program bekleniyor)

---

## Bloke Durumu

ARDA-49 Apple Developer Program üyeliği ($99/yıl) + App Store Connect API anahtarı CEO onayı bekliyor. Bu onay alınana kadar:

- ❌ macOS üzerinde iOS Simulator build alınamaz
- ❌ `xcrun simctl io screenshot` çalıştırılamaz
- ❌ Fastlane Snapshot otomatik capture yapılamaz

**UX şimdi ne yapabilir:**
- ✅ Bu spec dokümanı tamamlandı — tüm ekran, veri, durum tanımları hazır
- ✅ Chrome DevTools device emulation ile placeholder screenshot'lar alınabilir (Windows'ta)
- ✅ Placeholder'lar `ios/fastlane/screenshots/placeholders/` altında saklanabilir
- ✅ ARDA-49 çözüldüğünde bu spec birebir uygulanarak final screenshot'lar alınır

---

## App Store Screenshot Setleri

### 5 Ekran × 3 Cihaz = 15 Görüntü

Her ekran için 3 cihaz boyutunda screenshot alınacak:

| # | Ekran | Açıklama | Türkçe App Store Metni |
|---|-------|----------|----------------------|
| 1 | Hesaplama Formu | Ana hesaplama arayüzü, veri dolu | "Ardiyesiz giriş tarihini anında hesapla" |
| 2 | Planlama Sonucu | Ücretsiz gün + timeline görseli | "Ardiyesiz giriş başlangıcını gör" |
| 3 | Masraf Kırılımı | Kademeli tarife + bar chart | "Detaylı masraf analizi yap" |
| 4 | Konteyner Takibi | Canlı takip + hareket geçmişi | "Konteynerini anlık takip et" |
| 5 | Fiyatlandırma | 3 plan kartı | "İhtiyacına uygun planı seç" |

### Cihaz Boyutları

| Cihaz | Çözünürlük | Oran | CSS Viewport |
|-------|-----------|------|-------------|
| iPhone 6.7" (15 Pro Max) | 1290 × 2796 | 9:19.5 | 430 × 932 |
| iPhone 6.5" (14 Plus) | 1284 × 2778 | 9:19.5 | 428 × 926 |
| iPhone 5.5" (8 Plus) | 1242 × 2208 | 9:16 | 414 × 736 |

---

## Ekran 1: Hesaplama Formu

**Amaç:** Kullanıcının ana ürünü ilk gördüğü an. Temiz, odaklanmış, güven veren bir form.

### URL
`/hesaplama`

### Ön Koşullar
- [ ] Veritabanında en az 3 liman (Ambarlı, Mersin, İzmir), 3 hat (Maersk, MSC, CMA CGM), 3 ekipman tipi (20DC, 40HC, 40RF) tanımlı
- [ ] Test kullanıcısı **giriş yapmış** (Premium rozeti görünsün ama kilitli kalmasın — ya da giriş yapılmamış haliyle temiz form)
- [ ] Sayfa tam yüklenmiş, autocomplete verileri hazır

### Form Durumu (2 varyant — birini seç)

**Varyant A — Boş form (temiz başlangıç):**
- Tüm alanlar boş, placeholder metinler görünür
- "Ardiye Masrafı Analizi" bölümü kilitli (Premium kilidi)
- Canlı önizleme kartı boş durumda
- **Avantaj:** Uygulamanın sadeliğini gösterir
- **Dezavantaj:** Biraz boş durabilir

**Varyant B — Dolu form (önerilen) ✅:**
- Hat: **MAERSK LINE**
- Yükleme Limanı: **AMBARLI — İSTANBUL**
- Ekipman Tipi: **40HC (40' High Cube)**
- IMO (Tehlikeli Madde): **Kapalı**
- Gemi Kalkış Tarihi: **15.07.2026** (bugünden ~2 hafta sonrası)
- Canlı önizleme kartı: Timeline aktif, "Ardiyesiz Giriş ~22.07.2026" tahmini gösteriyor

### Görsel Notlar
- Header + AppShell görünür olmalı
- Form kartı ortalanmış, gölgeli, temiz
- Emerald yeşili vurgular (buton, aktif alan border'ları)
- Aydınlık tema (light mode)

---

## Ekran 2: Planlama Sonucu

**Amaç:** Ürünün temel değer teklifi — "ardiyesiz giriş tarihi" görselleştirmesi.

### URL
`/hesaplama/sonuc?freeUntil=2026-07-20&freeDays=5&warning=0`

### Ön Koşullar
- [ ] Query parametreleriyle sonuç sayfası yüklendi
- [ ] `freeUntil`: Gelecek bir tarih (örnek: 20.07.2026)
- [ ] `freeDays`: 5 (makul bir muafiyet süresi)
- [ ] `warning: 0` (uyarı yok, temiz sonuç)

### Görünüm
- **Header:** Ardiyesiz Giriş Tarihi kartı — büyük, yeşil vurgulu tarih
- **Timeline:** Zümrüt gradient bar, sol başta pulsing yeşil nokta "Ardiyesiz Giriş Başlangıcı", sağda gri nokta "Gemi Kalkış 15.07.2026"
- **Badge:** Yeşil "5 Gün Ücretsiz" rozeti
- **Detay satırları:** Liman, hat, ekipman tipi ikonlu satırlar
- **Aksiyon butonları:** "PDF İndir" + "E-posta ile Gönder" (altta)
- **Window chrome:** Üstte üç nokta + ardiyesizgiris.com label (ürün illüstrasyonuyla aynı)

### Görsel Notlar
- En yüksek görsel etkiye sahip ekran — App Store'da 2. sıraya koy
- Yeşil başarı hissi (CheckCircle2 ikonu)
- Timeline çubuğu emerald gradient ile dikkat çekici

---

## Ekran 3: Masraf Kırılımı

**Amaç:** Ürünün derinlikli analiz yeteneğini göster. Ücretli mod.

### URL
Hesaplama sonucu — cost mode. Query parametreleri cost hesaplaması içerecek şekilde.

Alternatif: Test verisiyle `/hesaplama` → cost sonucu al.

### Ön Koşullar
- [ ] Premium kullanıcı giriş yapmış
- [ ] "Ardiye Masrafı Analizi" açık
- [ ] Gate-in tarihi: 22.07.2026 (ardiyesiz girişten 2 gün sonra)
- [ ] Konteyner no: MSCU1234567
- [ ] Hesaplama yapılmış, masraf > 0 TL (örnek: 3 gün gecikme → ~1.500 TL)

### Görünüm
- **Header kartı:** "Toplam Masraf" — amber/sarı vurgulu (ücretli durum), örn: **1.250,00 TL**
- **İstatistik grid (3 sütun):**
  - Muafiyet Süresi: 5 gün
  - Liman Günü: 3 gün (ücretli)
  - Ücretli Gün: 3 gün
- **Masraf Kırılımı tablosu:**
  - Kademe 1 (0-3 gün): 250 TL/gün → 750 TL
  - Kademe 2 (4-7 gün): 500 TL/gün → 500 TL
  - Ara toplam + ek ücretler
- **Recharts bar chart:** Kademelere göre maliyet dağılımı (yeşilden sarıya gradient)
- **Ek ücretler tablosu:** Varsa hat ek ücretleri
- **Aksiyon butonları:** PDF İndir + E-posta ile Gönder

### Görsel Notlar
- Veri yoğun ama okunabilir olmalı — spacing ritmi önemli
- Bar chart görsel zenginlik katar
- "B2B veri analizi" hissi

---

## Ekran 4: Konteyner Takibi

**Amaç:** Ek ürün yeteneği — canlı konteyner takip. Bağımsız değer.

### URL
`/takip`

### Ön Koşullar
- [ ] Sayfa yüklendi
- [ ] Örnek tracking sonucu gösteriliyor (gerçek API veya mock)

### Görünüm
- **Form:** Konteyner No: MSCU1234567 (dolu), Hat: MSC (opsiyonel)
- **Durum kartı (sol panel):**
  - Konteyner: MSCU1234567
  - Durum: **TRANSIT** (yeşil badge)
  - Son Konum: Ambarli, Istanbul
  - Tahmini Varış: 20.07.2026
  - Son Güncelleme: 29.06.2026 14:30
- **Hareket Geçmişi (sağ panel) — timeline:**
  - 29.06 14:30 — Ambarli, Istanbul — Gümrük işlemleri tamamlandı
  - 27.06 08:15 — Ambarli, Istanbul — Limana varış
  - 22.06 16:00 — Port Said, Egypt — Transit geçiş
  - 15.06 10:00 — Singapore — Kalkış
- Emerald sol-border timeline tasarımı

### Görsel Notlar
- İki sütunlu düzen (mobilde dikey stack)
- Timeline bileşeni görsel olarak çekici
- Harita/rota görseli yoksa timeline ana görsel öğe

---

## Ekran 5: Fiyatlandırma

**Amaç:** İş modelini ve plan seçeneklerini göster.

### URL
`/fiyatlandirma`

### Ön Koşullar
- [ ] Sayfa yüklendi, 3 plan kartı görünür

### Görünüm
- **3 plan kartı (yatay sıralı):**
  - **Ücretsiz** — 0 TL/ay • 10 hesaplama/ay • Temel özellikler
  - **Profesyonel** — 249 TL/ay • Sınırsız hesaplama • Tüm limanlar/hatlar • PDF • Mobil • "En Popüler" rozeti
  - **Kurumsal** — İletişime geçin • Her şey + API • Takım yönetimi • SLA
- Profesyonel kartı yeşil vurgulu / yükseltilmiş
- CTA: "Profesyonel Başla" veya "İletişime Geç"

### Görsel Notlar
- Temiz, modern SaaS fiyatlandırma tasarımı
- "En Popüler" rozeti dikkat çekici
- Profesyonel plan öne çıkarılmış

---

## Capture Prosedürü

### Şimdi (Windows — Placeholder)

Chrome/Edge DevTools Device Mode ile:

```
1. Projeyi çalıştır: cd main && npm run dev
2. Tarayıcıda http://localhost:3000 aç
3. F12 → Device Toolbar (Ctrl+Shift+M)
4. Her ekran için:
   a. Doğru URL'ye git, veriyi doldur
   b. Device Mode'da özel boyut ekle (yukarıdaki CSS viewport değerleri)
   c. Device Toolbar menüsü → "Capture screenshot"
   d. Dosyayı şu formatta kaydet:
      ios/fastlane/screenshots/placeholders/{cihaz}_{ekran}_{no}.png
      Örnek: iphone67_01_hesaplama_formu.png
```

**Device Mode Ayarları:**
| Cihaz | Genişlik | Yükseklik | Device Pixel Ratio |
|-------|----------|-----------|-------------------|
| 6.7" | 430 | 932 | 3 |
| 6.5" | 428 | 926 | 3 |
| 5.5" | 414 | 736 | 3 |

**Not:** Chrome device mode screenshot'ları 1x çözünürlükte alır. App Store için 3x gerekir. Placeholder'lar referans amaçlıdır, final için gerçek iOS Simulator gerekir.

### ARDA-49 Çözüldüğünde (macOS — Final)

#### Adım 1: macOS ortamı hazırlığı
```bash
# Projeyi klonla
git clone <repo> ardiyesizgiris-ios
cd ardiyesizgiris-ios

# Bağımlılıkları yükle
npm ci
npx cap sync ios

# Xcode workspace'i aç
open ios/App/App.xcworkspace
```

#### Adım 2: Xcode'da build + çalıştır
```
1. Scheme: "App" seçili
2. Hedef cihaz: iPhone 15 Pro Max Simulator (iOS 18)
3. Product → Run (⌘R)
```

#### Adım 3: Screenshot al (her cihaz × her ekran)
```bash
# 6.7" için:
xcrun simctl boot "iPhone 15 Pro Max"
# ... app'te yukarıdaki 5 ekranı sırayla aç ...
xcrun simctl io "iPhone 15 Pro Max" screenshot iphone67_01_hesaplama_formu.png
xcrun simctl io "iPhone 15 Pro Max" screenshot iphone67_02_planlama_sonucu.png
xcrun simctl io "iPhone 15 Pro Max" screenshot iphone67_03_masraf_kirilimi.png
xcrun simctl io "iPhone 15 Pro Max" screenshot iphone67_04_konteyner_takibi.png
xcrun simctl io "iPhone 15 Pro Max" screenshot iphone67_05_fiyatlandirma.png

# Ardından 6.5" ve 5.5" için aynı işlem:
# iPhone 14 Plus (6.5") ve iPhone 8 Plus (5.5") simulator'larında tekrarla
```

#### Adım 4: Dosya organizasyonu
```
ios/fastlane/screenshots/
├── SCREENSHOTS.md          # Bu rehber (Türkçe)
├── CAPTURE_SPEC.md          # Bu doküman
├── placeholders/            # Windows placeholder'lar
│   ├── iphone67_01_hesaplama_formu.png
│   ├── iphone67_02_planlama_sonucu.png
│   └── ...
└── final/                   # iOS Simulator final görüntüleri
    ├── iphone67_01_hesaplama_formu.png
    ├── iphone67_02_planlama_sonucu.png
    └── ...
```

#### Adım 5: Fastlane deliver ile App Store'a yükle
```bash
fastlane deliver \
  --screenshots_path "./fastlane/screenshots/final" \
  --app_identifier "com.ardiyesizgiris.web" \
  --skip_binary_upload true \
  --skip_metadata false \
  --overwrite_screenshots true
```

---

## App Store Copy (Her Screenshot Alt Metni)

Her screenshot için App Store'da gösterilecek Türkçe tanıtım metni:

| # | Başlık | Alt Metin |
|---|--------|----------|
| 1 | Anında Hesapla | Liman, hat ve ekipman tipini seç, ardiyesiz giriş tarihini saniyeler içinde gör. |
| 2 | Ardiyesiz Giriş Tarihi | Zümrüt yeşili timeline ile muafiyet süreni net şekilde takip et. |
| 3 | Masraf Analizi | Kademeli tarife kırılımı ve grafikle toplam ardiye masrafını detaylı incele. |
| 4 | Canlı Konteyner Takibi | Konteynerinin anlık durumunu ve hareket geçmişini tek ekranda gör. |
| 5 | Esnek Planlar | Ücretsiz başla, ihtiyacın büyüdükçe Profesyonel veya Kurumsal plana geç. |

---

## Bağımlılıklar ve Sonraki Adımlar

| Durum | Görev | Sahibi |
|-------|-------|--------|
| ✅ Tamam | CAPTURE_SPEC.md — tüm ekran tanımları, veri durumları, prosedür | UXDesigner |
| ⬜ Bekliyor | ARDA-49: Apple Developer Program + CI secrets | CEO |
| ⬜ Bekliyor | Gerçek iOS Simulator screenshot'ları (5 ekran × 3 cihaz) | ARDA-49 sonrası UX/CTO |
| ⬜ Bekliyor | App Store Connect metadata + screenshot yükleme | ARDA-49 sonrası |

---

## Notlar

1. **Aydınlık tema** kullanılacak. Koyu tema screenshot'ları Apple tarafından önerilmez (her kullanıcı koyu mod kullanmıyor).
2. **Durum çubuğu (status bar)** temiz olmalı: saat 09:41, full WiFi, full batarya (Simulator varsayılanı).
3. **Türkçe karakterler** doğru görünmeli (Inter font — iOS 18'de native support var).
4. **Frameless** (cihaz çerçevesiz) screenshot'lar kullan. Apple frameless tercih ediyor.
5. **Toplam 15 görüntü** (5 ekran × 3 cihaz) — App Store 10 screenshot'a kadar izin veriyor, 5 ideal.
