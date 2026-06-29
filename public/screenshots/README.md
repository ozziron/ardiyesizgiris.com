# PWA Manifest Screenshots

Bu dizin, PWA kurulum diyaloğunda gösterilecek ekran görüntülerini içerir.

## Gerekli Dosyalar

| Dosya | Boyut | Form Factor | Hedef Sayfa |
|---|---|---|---|
| `desktop-wide.png` | 1280×800 | wide | `/hesaplama` — masaüstü hesaplama aracı |
| `mobile-narrow.png` | 390×844 | narrow | `/hesaplama` — mobil hesaplama aracı |

## Yakalama Gereksinimleri

### Genel
- **Tarayıcı:** Chrome/Edge (Chromium) en son kararlı sürüm
- **Tema:** Light mode (açık tema)
- **Dil:** Türkçe
- **Durum:** Gerçek veriyle dolu (placeholder değil)
- **Araç çubukları olmadan:** Tarayıcı UI'si olmadan, sadece uygulama içeriği
- **Format:** PNG, kayıpsız sıkıştırma (lossless)

### Desktop Wide (1280×800)
- **Viewport:** 1280×800
- **Sayfa:** `/hesaplama`
- **Beklenen içerik:**
  - Liman seçici (dropdown)
  - Konteyner tipi seçici
  - Tarih seçici
  - Hesaplama sonucu (örnek veriyle dolu)
  - Header ve footer eksiksiz
- **DPR:** 1x (cihaz piksel oranı)

### Mobile Narrow (390×844)
- **Viewport:** 390×844 (iPhone 14 Pro boyutu)
- **Sayfa:** `/hesaplama`
- **Beklenen içerik:**
  - Mobil uyumlu form
  - Mobil gezinme (hamburger menü kapalı)
  - Örnek hesaplama sonucu
- **DPR:** 1x

## Nasıl Üretilir

### Yöntem 1: Chrome DevTools ile Manuel

1. Chrome'da siteyi açın, DevTools → Toggle device toolbar
2. Desktop: Responsive modda 1280×800 girin, DPR: 1.0
3. Mobile: iPhone 14 Pro preset seçin, DPR: 1.0
4. `Ctrl+Shift+P` → "Capture full size screenshot"

### Yöntem 2: Playwright ile Otomatize

```bash
npx playwright screenshot --viewport-size=1280,800 \
  --device="iPhone 14 Pro" \
  https://ardiyesizgiris.com/hesaplama
```

### Yöntem 3: Firefox Responsive Design Mode

1. `Ctrl+Shift+M` ile responsive modu açın
2. Özel boyut: 1280×800 veya 390×844
3. Sağ tık → "Take Screenshot" → "Full Page"

## Kabul Kriterleri

- [ ] İki form factor için de ekran görüntüsü mevcut
- [ ] Gerçek veri ve dolu UI gösteriyor (boş state değil)
- [ ] Türkçe metinler doğru karakterlerle görünüyor
- [ ] PNG formatında, optimize edilmiş (< 300KB her biri)
- [ ] Uygulama chrome'u (başlık çubuğu) olmadan — sadece web içeriği
- [ ] Sade B2B lojistik tonu korunuyor

## Not

Bu ekran görüntüleri uygulama production'a deploy edildikten sonra gerçek
ortamdan alınmalıdır. Geliştirme aşamasında placeholder olarak boş
bırakılabilir veya `/public/placeholder.jpg` geçici olarak kullanılabilir.
