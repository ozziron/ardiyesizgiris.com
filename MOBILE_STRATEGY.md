# Mobile Platform Strategy — ardiyesizgiris.com

**Status:** Accepted
**Date:** 2026-05-15
**Decider:** Opus 4.7 (ticket TICKET-015)
**Ticket:** TICKET-015

---

## Bağlam

`DeveloperAgent.js` şablonunda `planMobileFeature` fonksiyonu **"VisionCam AI iOS app"** referansı taşıyor — bu, başka bir projeden devralınmış ölü şablon kodu. ardiyesizgiris.com için iOS native uygulama açma kararı **hiçbir zaman alınmadı**. Mevcut sistem Next.js 15 + Prisma + Neon üzerinde tamamen web tabanlı.

Roadmap'te "iOS/SwiftUI mobile başlangıç (mimari karar gerekiyor)" maddesi bu kafa karışıklığından doğdu. Bu doküman kararı netleştirir.

## Karar

**Kısa-orta vadede native iOS uygulaması açılmayacaktır. Mobile yaklaşım = PWA (Progressive Web App), tetiklenecek bir veri sinyali olduğunda.**

## Değerlendirilen Seçenekler

| Yaklaşım | Maliyet | UX | Yeni Codebase | Apple Dev Account | Karar |
|---|---|---|---|---|---|
| Native SwiftUI | Yüksek | En iyi (iOS) | Evet | Zorunlu | ❌ Reddedildi |
| React Native | Orta-Yüksek | İyi | Evet | App Store için zorunlu | ❌ Reddedildi |
| Capacitor (web wrap) | Düşük-Orta | Orta | Hafif | App Store için zorunlu | ⏸ Beklemede |
| **PWA (manifest + SW)** | **Düşük** | **İyi** (Safari sınırlı) | **Hayır** | **Hayır** | ✅ **Önerilen** |
| Status quo (responsive web) | Sıfır | Yeterli | Hayır | Hayır | ✅ **Şu an aktif** |

## Gerekçe

1. **Mevcut Next.js app zaten responsive.** Hesaplama akışı ve admin ekranları mobil tarayıcıda çalışıyor. Native gerekliliği için kullanıcı verisi henüz yok.

2. **Native iOS yatırımını haklı çıkaracak use-case'ler yok:**
   - Push notification: ardiye hesaplaması nadir/episodic kullanım, push gerektirmez.
   - Offline-first: hesaplama internet bağlantısı + canlı tarife verisi gerektirir, offline anlamlı değil.
   - App Store discovery: B2B logistics — kullanıcı arama davranışı App Store odaklı değil, organic search + referral.
   - iOS-specific entegrasyonlar (Apple Pay, Vision, HealthKit, vs.): konteyner ardiye iş akışıyla bağı yok.

3. **Maliyet asimetrisi:**
   - Apple Developer Program: $99/yıl
   - SwiftUI codebase: ayrı dil (Swift), ayrı UI framework, ayrı CI/CD pipeline, ayrı sürüm yönetimi
   - App Store review döngüsü: her sürümde 1-3 gün gecikme
   - Bu yatırım, mobile traffic verisi olmadan veya enterprise müşteri talebi olmadan haklı değil.

4. **PWA, zero-codebase mobile improvement:**
   - `manifest.json` + service worker + "Add to Home Screen" instruction
   - Mevcut Next.js ile native uyumlu — eklenecek kod minimal
   - iOS Safari PWA desteği sınırlı ama install + offline cache çalışıyor
   - Başarısız olursa Capacitor sonraki ucuz adım

## Action Items

### Şu Anda Yapılacak (Bu Commit)

- ✅ `DeveloperAgent.js` içindeki `planMobileFeature` template'i kaldırıldı (VisionCam AI/SwiftUI referansları yanıltıcı).
- ✅ Class header comment'i "web and mobile app development" → "web development" olarak güncellendi.
- ✅ Bu ADR oluşturuldu.

### Şu Anda Yapılmayacak (Future, Veri Bekleniyor)

- Mobile traffic analytics ekleme: Vercel Analytics veya benzeri üzerinden mobil % / sayfa / süre ölçümü. Karar sinyali için.
- PWA enhancement: manifest, service worker, install banner. Mobile traffic %20'yi aştığında veya kullanıcı talebi geldiğinde yeni bir ticket olarak açılır.
- Native iOS / React Native / Capacitor: PWA'nın yetmediği kanıtlanana kadar gündem dışı.

## Reversal Kriterleri

Bu karar şu durumlarda yeniden değerlendirilir:

1. Mobile traffic site trafiğinin **%40'ını** aşar ve kullanıcı survey'i native deneyim tercihi gösterir.
2. Enterprise müşteri kontratında native app maddesi bulunur.
3. iOS'a özel donanım/API gereksinimi (örn. konteyner barkod tarama) ürün roadmap'ine girer.
4. Apple veya rakipler distribution kanalını anlamlı biçimde değiştirir.

Bu durumda yeni bir ADR açılır; mevcut karar **superseded** olarak işaretlenir.
