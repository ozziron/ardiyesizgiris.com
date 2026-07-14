# Google Play Store — Ekran Görüntüleri

## Gerekli Boyutlar

| Cihaz | Minimum | Önerilen |
|-------|---------|----------|
| Telefon | 320–3840 px (en kısa kenar) | 1080 x 1920 px (16:9) |
| 7" Tablet | 320–3840 px | 1080 x 1920 px |
| 10" Tablet | 320–3840 px | 2048 x 1536 px (4:3) |

## Gerekli Görüntü Sayısı

- Minimum: 2 (telefon)
- Önerilen: 4–8 (her form factor için)

## Nasıl Alınır

### Seçenek 1: Android Emülatör (Windows/Linux)
```bash
# Emülatörde uygulamayı açıp screenshot almak için:
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./phone_01.png
```

### Seçenek 2: Gerçek Cihaz
- USB debugging açık bir Android telefonda uygulamayı çalıştır
- `adb shell screencap` ile veya manuel olarak screenshot al

### Seçenek 3: Chrome DevTools Mobile Mode
- Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- İlgili cihaz boyutunu seç (ör. Pixel 7 = 1080x1920)
- Screenshot al ve boyutu kontrol et

## Fastlane ile Otomatik Yükleme

Google Play Console'da en az bir defa manuel screenshot yükledikten sonra Fastlane ile otomatik yüklenebilir:

```ruby
# Fastfile'a eklenecek lane:
lane :upload_screenshots do
  supply(
    # metadata/screenshots klasörü Fastlane tarafından otomatik taranır
    skip_upload_apk: true,
    skip_upload_aab: true,
    skip_upload_metadata: false,
    skip_upload_images: false,
    skip_upload_screenshots: false,
  )
end
```

## Dosya İsimlendirme

Fastlane `fastlane/metadata/android/images/` altında şu yapıyı bekler:

```
images/
  phoneScreenshots/
    1_main.png
    2_calculation.png
    3_results.png
    4_pricing.png
  sevenInchScreenshots/
    ...
  tenInchScreenshots/
    ...
```

## Durum

- [x] Telefon ekran görüntüleri (4 adet) — 2026-06-29
- [ ] 7" tablet ekran görüntüleri (opsiyonel)
- [ ] 10" tablet ekran görüntüleri (opsiyonel)

## Mevcut Ekran Görüntüleri

| Dosya | Açıklama | Boyut |
|-------|----------|-------|
| `phoneScreenshots/1_main.png` | Ana sayfa — hero, özellikler, istatistikler | 1080×1920 |
| `phoneScreenshots/2_calculation.png` | Hesaplama formu — hat, liman, ekipman seçimi | 1080×1920 |
| `phoneScreenshots/3_results.png` | Hesaplama sonucu — ardiyesiz giriş tarihi | 1080×1920 |
| `phoneScreenshots/4_pricing.png` | Fiyatlandırma — üç plan kartı | 1080×1920 |

## Yakalama Yöntemi

Bu ekran görüntüleri headless Chrome + CDP (Chrome DevTools Protocol) ile alındı.
Script: `scripts/capture-playstore-screenshots.mjs`

```bash
# Önce dev server'ı başlat
npm run dev

# Sonra screenshot'ları al
node scripts/capture-playstore-screenshots.mjs
```

Cihaz emülasyonu: Pixel 7 (360×640 CSS, ×3 DPR = 1080×1920)
