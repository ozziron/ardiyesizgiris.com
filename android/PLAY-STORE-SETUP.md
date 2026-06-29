# Google Play Console — Internal Testing Kurulum Rehberi

Ardiyesiz Giriş Android uygulamasının Google Play Console'da internal testing track'ine yüklenmesi için adım adım rehber.

---

## 1. Ön Gereksinimler

- [ ] **Google Play Developer hesabı** — `play.google.com/console` üzerinden kayıt (tek seferlik 25$ ücret)
- [ ] **Signed Android App Bundle (.aab)** — release keystore ile imzalanmış build
- [ ] **Uygulama ikonu** — 512×512 PNG (mağaza listing ikonu)
- [ ] **Feature graphic** — 1024×500 PNG (Google Play'de üst banner)
- [ ] **En az 4 ekran görüntüsü** — 16:9 veya 9:16 oranlı, min 320px
- [ ] **Privacy policy URL** — `https://www.ardiyesizgiris.com/gizlilik`
- [ ] **Kısa açıklama** (80 karakter) ve **uzun açıklama** (4000 karakter)
- [ ] **İletişim e-postası** ve **web sitesi**
- [ ] **SHA256 parmak izi** — assetlinks.json'a eklenmiş olmalı

---

## 2. Uygulama Oluşturma

1. [Google Play Console](https://play.google.com/console/)'a giriş yapın
2. **Create app** butonuna tıklayın
3. Aşağıdaki bilgileri girin:

| Alan | Değer |
|------|-------|
| App name | Ardiyesiz Giriş |
| Default language | Turkish (tr-TR) |
| App or game | App |
| Free or paid | Free |
| Developer email | (şirket e-postası) |
| Privacy policy | `https://www.ardiyesizgiris.com/gizlilik` |

4. **Create app** → Terms of Service onaylayın

---

## 3. Mağaza Listing (Store Listing)

### 3.1 App Details

**Kısa açıklama (80 karakter):**
```
Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm limanlar için.
```

**Uzun açıklama (Türkçe örnek):**
```
Ardiyesiz Giriş, konteyner taşımacılığında ardiyesiz (demurrage-free) giriş tarihlerini anında hesaplayan profesyonel bir lojistik aracıdır.

ÖZELLİKLER:
• Tüm Türkiye limanlarında ardiyesiz giriş tarihi hesaplama
• Denizyolu hattı (shipping line) bazlı tarife bilgisi
• Tier bazlı ardiye (demurrage) masraf hesaplama
• Armatör muafiyetleri ve tatil günleri dahil doğru hesaplama
• Premium masraf tablosu ve zaman çizelgesi
• PDF rapor çıktısı ve paylaşım
• Tamamen Türkçe arayüz, tüm diy kritik karakterler destekli

KİMLER İÇİN?
• İthalat/İhracat operasyon uzmanları
• Lojistik ve gümrük profesyonelleri
• Fabrika sevkiyat departmanları
• Forwarder ve acente çalışanları
```

### 3.2 Grafikler (Graphics)

| Asset | Boyut | Açıklama |
|-------|-------|----------|
| App icon | 512×512 | `icon-1024.png` (proje içinde mevcut) |
| Feature graphic | 1024×500 | Üst banner |
| Screenshots | 9:16, min 320px | En az 4 adet telefon ekran görüntüsü |

**Önerilen Screenshot Seti:**
1. Ana ekran (hero + CTA)
2. Hesaplama formu (doldurulmuş)
3. Sonuç ekranı (ardiyesiz tarih + timeline)
4. Masraf dökümü (Premium)
5. Fiyatlandırma sayfası
6. Sözlük sayfası

### 3.3 Kategorizasyon

| Alan | Değer |
|------|-------|
| Category | Business |
| Tags | logistics, shipping, container, calculator |

---

## 4. Internal Testing Track Kurulumu

### 4.1 Test Track'i Açma

1. Sol menü → **Testing** → **Internal testing**
2. **Create internal test** butonu
3. Track adı: `internal` (varsayılan)

### 4.2 İlk Sürümü Yükleme

1. **Create new release** butonu
2. **App bundles** → **Upload** → `.aab` dosyasını seçin
3. **Release name:** `1.0.0 (versionCode: 1)`
4. **Release notes:**
   ```
   İlk internal test sürümü.
   
   - Ardiyesiz giriş hesaplama
   - Ardiye masraf tablosu (Premium)
   - Tüm limanlar ve armatörler destekleniyor
   - PDF çıktı ve paylaşım
   ```

### 4.3 Test Kullanıcıları Ekleme

**Email list oluşturma:**
1. Internal Testing → **Testers** tab
2. **Create email list**
3. Liste adı: `İç Test Ekibi`
4. E-postaları ekleyin:
   ```
   ceo@ardiyesizgiris.com
   cto@ardiyesizgiris.com
   qa@ardiyesizgiris.com
   ux@ardiyesizgiris.com
   ```
5. **Save**

**Davet linki paylaşma:**
1. Internal Testing sayfasında **"Share link"** kopyalayın
2. Link formatı: `https://play.google.com/store/apps/details?id=com.ardiyesizgiris.web`
3. Alternatif: `https://play.google.com/apps/testing/com.ardiyesizgiris.web`

### 4.4 Yayınla (Publish)

1. **Review release** → hataları kontrol edin
2. **Start rollout to internal testing** → **Publish**
3. Yayın ~15 dakika içinde test kullanıcılarına ulaşır

---

## 5. Digital Asset Links Doğrulaması

Google Play, TWA uygulamalarında domain sahipliğini `assetlinks.json` üzerinden doğrular.

**Dosya yolu:** `https://www.ardiyesizgiris.com/.well-known/assetlinks.json`

**Doğrulama kontrolü:**
```bash
# Manuel doğrulama
curl https://www.ardiyesizgiris.com/.well-known/assetlinks.json

# Google'ın doğrulama aracı
# https://digitalassetlinks.googleapis.com/v1/statements:list?
#   source.web.site=https://www.ardiyesizgiris.com&
#   relation=delegate_permission/common.handle_all_urls
```

⚠️ **SHA256 parmak izi değişirse** Play Console'da `"Your app cannot be verified"` hatası alınır. Bu durumda:
1. Yeni release keystore SHA256'sini al: `keytool -list -v -keystore release.keystore | grep SHA256`
2. `assetlinks.json`'u güncelle
3. Siteye deploy et
4. Play Console'da `Retry verification` yap

---

## 6. Test Kullanıcıları İçin Kurulum Rehberi

Test kullanıcılarına gönderilecek talimatlar:

```
Ardiyesiz Giriş — Android Internal Test

Uygulamanın test sürümüne katılmak için:

1. Bu linke tıklayın: [DAVET LINKI]
2. Google Play'de "Install" butonuna tıklayın
3. "You're now a tester" mesajını gördükten sonra uygulama yüklenecektir

Not: Test sürümü yalnızca davet linkini alan Google hesaplarına açıktır.
Geri bildirimlerinizi ceo@ardiyesizgiris.com adresine iletebilirsiniz.
```

---

## 7. Sürüm Yönetimi

### Yeni Sürüm Yayınlama

1. `android/app/build.gradle.kts` içinde:
   ```kotlin
   versionCode = 2  // Her sürümde +1 artırın
   versionName = "1.0.1"
   ```
2. Yeni `.aab` build alın: `./gradlew bundleRelease`
3. Play Console → Internal Testing → **Create new release**
4. Yeni `.aab`'i yükleyin
5. Sürüm notlarını güncelleyin
6. **Review** → **Publish**

### Production'a Geçiş

Internal testing başarılı olduğunda:

1. Aynı `.aab` dosyasıyla **Closed testing** veya **Production** track'ine geçiş yapın
2. Production için Google'ın ek inceleme süreci vardır (birkaç gün sürebilir)
3. TWA'nın Digital Asset Links doğrulamasından geçtiğinden emin olun

---

## 8. Önemli Notlar

- **Keystore kaybedilirse** uygulama güncellenemez. Yedekleyin.
- **Google Play Signing:** İlk yüklemede Google kendi imzalama anahtarını oluşturur (App Signing by Google Play). Sonraki build'lerde Google sizin upload key'inizle imzalar ve kendi anahtarıyla yeniden imzalar.
- **SHA256 değişikliği:** Google Play Signing kullanıyorsanız, `assetlinks.json`'da Google'ın verdiği SHA256'yi kullanmalısınız (sizin upload key'inizin SHA256'si değil).
- **TWA policy:** Uygulamanın açılışta direkt TWA'ya yönlenmesi ve kullanıcıya boş bir WebView göstermemesi gerekir.
- **WebView hataları:** TWA başlatılamazsa, Custom Tabs fallback'i devreye girer.

---

## 9. İletişim ve Destek

- **Google Play Console yardım:** https://support.google.com/googleplay/android-developer
- **TWA dokümantasyonu:** https://developers.google.com/web/android/trusted-web-activity
- **Şirket içi:** ceo@ardiyesizgiris.com
