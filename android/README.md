# Ardiyesiz Giriş — Android TWA App

Bu dizin, [ardiyesizgiris.com](https://www.ardiyesizgiris.com) PWA'sini **Trusted Web Activity (TWA)** kullanarak native Android uygulaması olarak paketleyen projeyi içerir.

## Teknik Yapı

- **Paket adı:** `com.ardiyesizgiris.web`
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** 35 (Android 15)
- **TWA kütüphanesi:** `com.google.androidbrowserhelper:androidbrowserhelper:2.5.0`
- **Gradle:** 8.11.1
- **JDK:** 21+ (Temurin)
- **Uygulama tipi:** Trusted Web Activity (tarayıcısız, tam ekran PWA)

## Ön Gereksinimler

1. **JDK 21+** — [Eclipse Temurin](https://adoptium.net/)
2. **Android Studio** (önerilen) veya **Android SDK Command-line Tools**
   - Android Studio: [developer.android.com/studio](https://developer.android.com/studio)
   - Command-line: `sdkmanager` ile `build-tools;35.0.0`, `platforms;android-35`, `platform-tools` kurun
3. **Keystore** — İlk build öncesi oluşturulmalı (aşağıdaki adımlara bakın)

## İlk Kurulum

### 1. Keystore Oluşturma

```bash
keytool -genkey -v -keystore ardiyesizgiris-release.keystore \
  -alias ardiyesizgiris -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_STORE_PASS -keypass YOUR_KEY_PASS \
  -dname "CN=Ardiyesiz Giris, OU=Engineering, O=ArdiyesizGiris, L=Istanbul, ST=Istanbul, C=TR"
```

### 2. `keystore.properties` Dosyasını Oluşturun

```properties
storeFile=ardiyesizgiris-release.keystore
storePassword=YOUR_STORE_PASS
keyAlias=ardiyesizgiris
keyPassword=YOUR_KEY_PASS
```

⚠️ **Bu dosyayı asla commit etmeyin.** `.gitignore`'da zaten hariç tutulmuştur.

### 3. Android SDK Kurulumu (Android Studio olmadan)

```bash
# SDK command-line tools'u indir ve aç
# https://developer.android.com/studio#command-line-tools-only

# Gerekli paketleri kur
sdkmanager "build-tools;35.0.0" "platforms;android-35" "platform-tools"

# ANDROID_HOME ortam değişkenini ayarla
export ANDROID_HOME=/path/to/android-sdk
```

### 4. Build Alma

```bash
# Android Studio ile:
#   File → Open → bu dizini seç → Build → Generate Signed Bundle / APK → Android App Bundle

# Veya komut satırından:
./gradlew bundleRelease

# Çıktı: app/build/outputs/bundle/release/app-release.aab
```

## SHA256 Parmak İzi (assetlinks.json)

Google Play yayını için `assetlinks.json` dosyasındaki SHA256 değeri, release keystore'unuza ait olmalıdır.

Release keystore SHA256'sini almak için:

```bash
keytool -list -v -keystore ardiyesizgiris-release.keystore | grep SHA256
```

Bu değeri `.well-known/assetlinks.json` dosyasında güncelleyin ve sitenizin kök dizininde yayınlayın.

## Google Play Console — Internal Testing

### İlk Yükleme

1. [Google Play Console](https://play.google.com/console/) → Uygulama oluştur
2. **Internal testing** track'ini seçin
3. `.aab` dosyasını yükleyin
4. Sürüm notlarını girin ("İlk internal test sürümü")
5. Test kullanıcılarını e-posta ile ekleyin
6. Yayınla

### Test Kullanıcıları Ekleme

- **E-posta listesi:** Internal Testing → Testers → Create email list
- Test kullanıcıları **Google Play'e kendi hesaplarıyla giriş yapmış** olmalı
- Davet linki: Internal Testing sayfasındaki "Share link" bağlantısı
- Test kullanıcıları linke tıklayıp "Install" dedikten sonra uygulamayı indirebilir

### Sürüm Güncelleme

Her yeni sürümde:
1. `versionCode` ve `versionName` değerlerini `app/build.gradle.kts`'de artırın
2. Yeni `.aab` build alın
3. Play Console → Internal Testing → Create new release → Yeni .aab yükleyin
4. Sürüm notlarını güncelleyin

### Digital Asset Links Doğrulaması

Play Console, TWA'nın domain sahipliğini doğrulamak için `assetlinks.json`'u kontrol eder.
Dosyanın `https://www.ardiyesizgiris.com/.well-known/assetlinks.json` adresinde erişilebilir olduğundan emin olun.

## Versiyon Geçmişi

| Sürüm | versionCode | Tarih | Notlar |
|-------|-------------|-------|--------|
| 1.0.0 | 1 | - | İlk internal test sürümü |

## Dosya Yapısı

```
android/
├── app/
│   ├── build.gradle.kts           # App modülü (TWA bağımlılığı, signing, version)
│   ├── proguard-rules.pro         # R8 minification kuralları
│   └── src/main/
│       ├── AndroidManifest.xml     # TWA activity, intent filter'lar, meta-data
│       ├── res/
│       │   ├── drawable/          # Adaptive icon katmanları, splash icon
│       │   ├── mipmap-*/          # Launcher icon density'leri
│       │   ├── mipmap-anydpi-v26/ # Adaptive icon XML tanımları
│       │   ├── values/            # strings, colors, themes
│       │   └── xml/               # App shortcuts
│       └── java/com/ardiyesizgiris/web/  # (özel Java kodu gerekmez)
├── build.gradle.kts               # Root build (AGP plugin)
├── settings.gradle.kts             # Modül ve repository ayarları
├── gradle.properties               # JVM ve Android ayarları
├── keystore.properties             # 🚫 Keystore şifreleri (commit edilmez)
└── gradle/wrapper/
    └── gradle-wrapper.properties   # Gradle sürümü
```
