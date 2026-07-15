# Capacitor Deep Link Yapılandırması — ardiyesizgiris.com

> **Konu:** ARDA-45 — Android App Links + iOS Universal Links  
> **Hedef kitle:** Mobile developer (Capacitor projesini kuracak kişi)  
> **Tarih:** 2026-06-29  
> **Ön koşul:** `.well-known/` endpoint'leri web tarafında canlıda olmalı (bu repo'da ✓)

---

## 1. Genel Mimari

```
Email (doğrulama/hesap linki)
  ↓
https://ardiyesizgiris.com/api/auth/verify-email?token=...
  ↓
OS (Android/iOS) → .well-known/ dosyasını kontrol eder
  ├─ Native app yüklü ve domain doğrulanmış → App'te açılır
  └─ Native app yüklü değil → Tarayıcıda açılır (mevcut davranış)
```

**Web tarafında yapılanlar (bu repo):**
- `app/.well-known/assetlinks.json/route.ts` — Android App Links doğrulama endpoint'i
- `app/.well-known/apple-app-site-association/route.ts` — iOS Universal Links doğrulama endpoint'i
- `lib/deep-link/config.ts` — Merkezi yapılandırma (env-var tabanlı)

---

## 2. Capacitor Projesinde Yapılacaklar

### 2.1 Gerekli Plugin'ler

```bash
# Capacitor App plugin (deep link handling)
npm install @capacitor/app

# (Opsiyonel) Firebase Dynamic Links — eğer fallback URL'ler için kullanılacaksa
# npm install @capacitor-firebase/app
```

### 2.2 Android Yapılandırması

#### 2.2.1 `capacitor.config.ts`

```ts
const config: CapacitorConfig = {
  appId: 'com.ardiyesizgiris.app',  // package_name ile aynı olmalı
  appName: 'Ardiyesiz Giriş',
  webDir: 'out',
  server: {
    // Production'da Next.js export'u, dev'de canlı site
    url: 'https://ardiyesizgiris.com',
    cleartext: false,
  },
  // ...
}
```

#### 2.2.2 Android `AndroidManifest.xml` — Intent Filter

`android/app/src/main/AndroidManifest.xml` içinde `<activity>` altına:

```xml
<!-- Android App Links — deep link desteği -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <!-- Tüm path'leri yakala — AASA'daki "*" ile aynı kapsam -->
    <data
        android:scheme="https"
        android:host="ardiyesizgiris.com" />
    <data
        android:scheme="https"
        android:host="www.ardiyesizgiris.com" />
</intent-filter>
```

**Önemli:** `android:autoVerify="true"` olmazsa Google assetlinks doğrulaması yapmaz ve deep link'ler uygulamada açılmaz.

#### 2.2.3 SHA-256 Parmak İzi Alma

Release keystore'dan SHA-256 fingerprint'i al:

```bash
keytool -list -v -keystore release.keystore -alias upload | grep SHA256
```

Bu değeri **Production Vercel**'de `DEEP_LINK_ANDROID_SHA256_FINGERPRINTS` env var'ına yaz.  
Debug build için ayrıca debug.keystore fingerprint'ini de ekle (virgülle ayırarak).

#### 2.2.4 Android Deep Link Handling (Kotlin/Java)

`MainActivity.kt` içinde (Capacitor 5+ için genelde otomatik):

```kotlin
import com.getcapacitor.BridgeActivity
import com.getcapacitor.Plugin

class MainActivity : BridgeActivity() {
    // Capacitor App plugin otomatik olarak deep link'leri yakalar.
    // Ek handling gerekiyorsa:
    // override fun onNewIntent(intent: Intent) { ... }
}
```

### 2.3 iOS Yapılandırması

#### 2.3.1 Xcode — Associated Domains

1. Xcode'da projeyi aç: `ios/App/App.xcworkspace`
2. Target → **Signing & Capabilities** → **+ Capability** → **Associated Domains**
3. Domains listesine ekle:
   ```
   applinks:ardiyesizgiris.com
   applinks:www.ardiyesizgiris.com
   webcredentials:ardiyesizgiris.com
   ```

#### 2.3.2 Apple Developer Team ID

Apple Developer hesabındaki **Team ID**'yi al ve Vercel Production'da `DEEP_LINK_IOS_TEAM_ID` env var'ına yaz.

#### 2.3.3 iOS Deep Link Handling (Swift)

`AppDelegate.swift` içinde:

```swift
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    // ...

    func application(_ application: UIApplication,
                     continue userActivity: NSUserActivity,
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Universal Links buradan yakalanır
        return true
    }
}
```

`capacitor.config.ts`'te iOS için ek ayar:

```ts
ios: {
  // iOS URL scheme — uygulamanın handle edeceği scheme
  scheme: 'ardiyesizgiris',
}
```

---

## 3. Deep Link Testi

### 3.1 Android Testi

```bash
# Emülatörde / cihazda test
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://ardiyesizgiris.com/api/auth/verify-email?token=test" \
  com.ardiyesizgiris.app
```

Doğrulama durumunu kontrol et:

```bash
adb shell pm get-app-links com.ardiyesizgiris.app
# Çıktıda "ardiyesizgiris.com verified: true" görmelisiniz
```

### 3.2 iOS Testi

1. Xcode'da scheme seçin → Run
2. Safari'ye `https://ardiyesizgiris.com` yazın → üstte "Open in App" banner'ı çıkmalı
3. Veya: Notes'a link yapıştırın, long-press → "Open in Ardiyesiz Giriş"

Apple doğrulama aracı: https://search.developer.apple.com/appsearch-validation-tool/

### 3.3 Web Tarafı Testi

```bash
# assetlinks.json doğru dönüyor mu?
curl https://ardiyesizgiris.com/.well-known/assetlinks.json

# apple-app-site-association doğru dönüyor mu?
curl https://ardiyesizgiris.com/.well-known/apple-app-site-association
```

---

## 4. Email Link'leri ve Deep Link Akışı

Şu anki email link'leri **standart HTTPS URL'lerdir** — bu bilinçli bir tasarımdır:

| Email Tipi | Link Örneği | Native App'te Açılma |
|---|---|---|
| Email doğrulama | `https://ardiyesizgiris.com/api/auth/verify-email?token=...` | App yüklüyse → App'te `/api/auth/verify-email?token=...` işlenir. Değilse → tarayıcıda doğrulanır. |
| Hesap sonucu link'i (varsa) | `https://ardiyesizgiris.com/hesaplamalarim/abc123` | App yüklüyse → App'te `/hesaplamalarim/abc123` açılır. Değilse → tarayıcı. |

**Değişiklik gerekmez.** Universal Links / App Links doğası gereği standart HTTPS URL'leri kullanır. `.well-known/` dosyaları domain-handler eşleşmesini OS düzeyinde sağlar.

---

## 5. Ortam Değişkenleri Özeti

| Değişken | Örnek Değer | Ne Zaman Doldurulur |
|---|---|---|
| `DEEP_LINK_ANDROID_PACKAGE_NAME` | `com.ardiyesizgiris.app` | Android projesi oluşturulunca (varsayılan zaten bu) |
| `DEEP_LINK_ANDROID_SHA256_FINGERPRINTS` | `A1B2C3...` | Release build alındıktan sonra (keytool ile) |
| `DEEP_LINK_IOS_TEAM_ID` | `ABCDE12345` | Apple Developer hesabı açıldıktan sonra |
| `DEEP_LINK_IOS_BUNDLE_ID` | `com.ardiyesizgiris.app` | iOS projesi oluşturulunca (varsayılan zaten bu) |

Tüm değişkenler **opsiyoneldir** — boş bırakıldığında `.well-known/` endpoint'leri geçerli ama boş JSON döner, deep link çalışmaz, tarayıcıya fallback yapılır.
