# Store Privacy Labels & Data Safety — Ardiyesiz Giriş

Bu belge, Ardiyesiz Giriş uygulamasının Apple App Store ve Google Play Store
gizlilik gereksinimleri için referans yapılandırmasını içerir.

**Son güncelleme:** 29 Haziran 2026

---

## Apple App Store — Privacy Nutrition Labels

App Store Connect → Uygulama → App Privacy bölümünde aşağıdaki etiketler
kullanılmalıdır. Bu etiketler `ios/App/PrivacyInfo.xcprivacy` manifestindeki
`NSPrivacyCollectedDataTypes` ile uyumludur.

### Data Types

| Veri Tipi | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|
| **Name** (Ad soyad) | Yes | No | App Functionality, Product Personalization |
| **Email Address** | Yes | No | App Functionality, Developer Communication |
| **Phone Number** | Yes | No | App Functionality, Developer Communication |
| **User ID** | Yes | No | App Functionality |
| **Product Interaction** | No | No | Analytics |
| **Performance Data** | No | No | Analytics, App Functionality |
| **Crash Data** | No | No | App Functionality |

### NOT Collected

Aşağıdaki veri tipleri **toplanmaz**. App Store Connect'te bu tipler için
"Data Not Collected" seçilmelidir:

- **Health & Fitness:** Sağlık verisi toplanmaz
- **Financial Info:** Ödeme/kart bilgisi toplanmaz
- **Location:** Konum (Precise/Coarse) toplanmaz
- **Sensitive Info:** Irk, etnik köken, cinsel yönelim, dini inanç vb.
- **Contacts:** Cihaz rehberine erişilmez
- **User Content:** E-posta/SMS içerikleri, fotoğraf, video, ses kaydı
- **Browsing History:** Harici sitelerde gezinme geçmişi
- **Search History:** (hesaplama geçmişi "Product Interaction" altında)
- **Identifiers — Device ID:** Cihaz reklam tanımlayıcısı (IDFA) kullanılmaz
- **Purchases:** Uygulama içi satın alma yok
- **Other Data Types** (fitness, game center, etc.)

### Tracking

- **App Tracking Transparency (ATT):** Uygulama **kullanıcı takibi yapmaz**.
  `NSPrivacyTracking` = `false`. ATT izin diyaloğu gösterilmez.
- **Reklam:** Uygulamada reklam ağı veya davranışsal reklamcılık yoktur.
- **Veri aracıları:** Veriler üçüncü taraf veri simsarlarına satılmaz veya
  paylaşılmaz.

---

## Google Play — Data Safety Section

Play Console → Uygulama → Policy → App content → Data safety bölümünde
aşağıdaki bildirimler yapılmalıdır.

### Data Collection & Security

| Kategori | Veri Tipi | Toplanıyor? | Paylaşılıyor? | Amaç | Opsiyonel? |
|---|---|---|---|---|---|
| Personal info | Name | Yes | No | App functionality, Personalization | Yes (kayıt olunursa) |
| Personal info | Email address | Yes | No | App functionality, Developer communications | Yes (kayıt olunursa) |
| Personal info | Phone number | Yes | No | App functionality, Developer communications | Yes (kayıt olunursa) |
| Personal info | User IDs | Yes | No | App functionality | Yes (kayıt olunursa) |
| App activity | App interactions | Yes | No | Analytics | No |
| App info & performance | Crash logs | Yes | No | App functionality | No |
| App info & performance | Diagnostics | Yes | No | Analytics, App functionality | No |
| Device or other IDs | Device or other IDs | Yes | No | App functionality | No |

### Data NOT Collected

- **Location** (Approximate / Precise)
- **Financial info**
- **Health and fitness**
- **Messages**
- **Photos and videos**
- **Audio files**
- **Files and docs**
- **Calendar**
- **Contacts**
- **Web browsing history**
- **Installed apps**

### Data Security

- **Encryption in transit:** Yes (HTTPS / TLS)
- **Data deletion request:** Yes — kullanıcılar hesaplarını silerek verilerinin
  kaldırılmasını talep edebilir. İletişim formu veya e-posta yoluyla başvuru
  yapılabilir.
- **Data sharing:** Veriler üçüncü taraflarla paylaşılmaz (altyapı
  sağlayıcıları hariç; onlar da yalnızca hizmetin ifası için gerekli minimum
  veriyi işler).

---

## Privacy Policy URL

**Canonical URL:** `https://www.ardiyesizgiris.com/gizlilik-politikasi`

Bu URL:
- App Store Connect → App Privacy → Privacy Policy URL
- Google Play Console → Policy → App content → Privacy policy

alanlarında belirtilmelidir.

---

## Privacy Accessed API Types (iOS)

`PrivacyInfo.xcprivacy` içinde deklare edilen API'ler ve gerekçeleri:

| API Kategorisi | Reason Code | Açıklama |
|---|---|---|
| `NSPrivacyAccessedAPICategoryUserDefaults` | `CA92.1` | Uygulama ayarları ve kullanıcı tercihlerinin saklanması |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | `0A2A.1` | Dosya önbelleği ve Service Worker cache yönetimi |
| `NSPrivacyAccessedAPICategoryDiskSpace` | `E174.1` | Service Worker depolama kotası kontrolü |
| `NSPrivacyAccessedAPICategorySystemBootTime` | `35F9.1` | Anonim performans analitiği (Vercel Analytics) |

---

## Üçüncü Taraf SDK Gizlilik Referansları

Uygulamanın bağımlı olduğu üçüncü taraf servislerin gizlilik uygulamaları:

| Servis | Kullanım | Gizlilik Politikası |
|---|---|---|
| Vercel Analytics | Anonim kullanım analitiği | vercel.com/docs/analytics/privacy |
| Vercel Speed Insights | Performans metrikleri | vercel.com/docs/speed-insights/privacy |
| Neon Postgres | Veritabanı barındırma | neon.tech/privacy-policy |
| Resend | E-posta gönderimi | resend.com/privacy |

---

## KVKK / GDPR Uyum Notu

Türkiye'deki kullanıcılar için 6698 sayılı KVKK kapsamındaki aydınlatma
metni `/kvkk` sayfasında yer almaktadır. Bu metin KVKK'nın gerektirdiği
tüm unsurları (veri sorumlusu, işlenen veriler, amaçlar, hukuki dayanak,
aktarım, saklama süresi, ilgili kişi hakları, başvuru yöntemi) içerir.

Her iki platform da (App Store, Google Play) GDPR/KVKK uyumlu bir gizlilik
politikası ve kullanıcı verisi silme mekanizması bekler. Bu gereksinimler
`/gizlilik-politikasi` sayfasındaki "Haklarınız" ve "İletişim" bölümlerinde
karşılanmıştır.
