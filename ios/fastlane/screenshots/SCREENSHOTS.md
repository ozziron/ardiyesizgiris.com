# App Store Connect — Ekran Görüntüleri

## Gerekli Boyutlar (2025 itibarıyla)

| Cihaz | Çözünürlük | Oran |
|-------|-----------|------|
| iPhone 6.7" (15 Pro Max) | 1290 x 2796 px | 9:19.5 |
| iPhone 6.5" (14 Plus) | 1284 x 2778 px | 9:19.5 |
| iPhone 5.5" (8 Plus) | 1242 x 2208 px | 9:16 |

## Gerekli Görüntü Sayısı

- Minimum: 1 set (3 boyut) — ama 3 set önerilir (9 görüntü)
- Maksimum: 10 görüntü/set

## Nasıl Alınır (macOS Gerektirir)

### Seçenek 1: iOS Simülatör
```bash
# Simülatörde app açıldıktan sonra:
xcrun simctl io booted screenshot screenshot_iphone_67_01.png
```

### Seçenek 2: Xcode Organizer
- Xcode → Window → Devices and Simulators
- Cihaz seç → Take Screenshot

### Seçenek 3: Fastlane Snapshot (Otomatik)
```ruby
# Fastfile:
lane :screenshots do
  capture_screenshots(
    scheme: "App",
    devices: [
      "iPhone 15 Pro Max",   # 6.7"
      "iPhone 14 Plus",      # 6.5"
      "iPhone 8 Plus",       # 5.5"
    ],
    languages: ["tr"],
    localize_simulator: true,
  )
end
```

## Fastlane ile Otomatik Yükleme

```bash
fastlane deliver \
  --screenshots_path "./fastlane/screenshots" \
  --app_identifier "com.ardiyesizgiris.web" \
  --skip_binary_upload true \
  --skip_metadata false \
  --overwrite_screenshots true
```

## Durum

- [ ] iPhone 6.7" ekran görüntüleri
- [ ] iPhone 6.5" ekran görüntüleri
- [ ] iPhone 5.5" ekran görüntüleri

**Not:** iOS ekran görüntüleri almak için macOS ve çalışan bir iOS build'i zorunludur.
