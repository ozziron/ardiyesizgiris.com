# 📋 BUSINESS RULES - Ardiyesiz Giriş Hesaplama Sistemi

## Durum
- ✅ **İlk Versiyon Kuralları Implemente Edildi**
- ⏳ **Gelecekte Eklenecek Kurallar için Planlama Alanı**

---

## 🔄 MEVCUT HESAPLAMA KURALLARI (v1.0)

### Temel Mantık
1. **Departure günü = 1. muafiyet günü** (dahil sayılır)
2. **Ardiyesiz Giriş Başlangıcı = Departure - Free Days + 1**
3. **Toplam Kalış = (Departure - Gate-In) + 1** (her iki gün dahil)
4. **Ücretli Ardiye = Toplam Kalış - Muafiyet Günleri**
5. **Kademeli Ücret = Tier 1 → Tier 2 → Tier 3** (sırayla)

### Dosyalar
- **Calculation Logic:** `/lib/calculations/calculate-tariff.ts`
- **Validation Schemas:** `/lib/validation/schemas.ts`
- **Tests:** (Henüz yok - eklenebilir)

### Test Senaryoları
```
Senaryo 1: Muafiyet İçinde Gate-In
- Departure: 23.06.2026
- Muafiyet: 7 gün (17.06 - 23.06)
- Gate-In: 20.06.2026
- Sonuç: Tamamı Ücretsiz ✓

Senaryo 2: Muafiyetten Önce Gate-In
- Departure: 23.06.2026
- Muafiyet: 7 gün
- Gate-In: 13.06.2026
- Toplam Kalış: 11 gün
- Ücretli: 4 gün (13-16.06)
- Sonuç: 4 gün × Tier 1 fiyat

Senaryo 3: Geç Gate-In (Departure Sonrası)
- Departure: 23.06.2026
- Gate-In: 25.06.2026
- Sonuç: ⚠️ Uyarı göster
```

---

## 🚀 GELECEKTEKİ KURALLAR (PLACEHOLDER)

### Potansiyel Özellikler

#### 1. **Konteyner Boyutuna Göre Farklı Ücret**
- **Şuan:** Tip bazlı (20DC, 40DC, vb.)
- **İhtiyaç:** Boyuta göre multiplier?
- **Yorum:** `containerSize` field eklenebilir

#### 2. **Mevsimsel Ücret Ayarlaması**
- **Şuan:** Sabit fiyat
- **İhtiyaç:** Summer/Winter season multipliers?
- **Yorum:** `TariffRule.seasonMultiplier` eklenebilir

#### 3. **Uzun Süreli Muafiyet Bonusu**
- **Şuan:** Sabit muafiyet
- **İhtiyaç:** 30+ gün için ek bonus?
- **Yorum:** `FreeTimeRule.extendedBonus` eklenebilir

#### 4. **Kurumsal Müşteri Indirimi**
- **Şuan:** Yok
- **İhtiyaç:** Corporate users için % discount?
- **Yorum:** `User.corporateDiscountPercentage` eklenebilir

#### 5. **Erken Tahliye Primi**
- **Şuan:** Yok
- **İhtiyaç:** Erken çıkış durumunda credit/refund?
- **Yorum:** Yeni `EarlyReleaseCredit` model eklenebilir

#### 6. **Hafta Sonu/Tatil Günü Muafiyeti**
- **Şuan:** Yok (takvim farkı yok)
- **İhtiyaç:** Weekend sayılmıyor mu?
- **Yorum:** `calculateArdiye()` fonksiyonunda `excludeWeekends` param

#### 7. **Liman Kapasite Ücreti**
- **Şuan:** Yok
- **İhtiyaç:** Yoğun sezonlarda ek ücret?
- **Yorum:** `Port.capacityCharge` field eklenebilir

---

## 📝 RULE EKLEME ADIMLAR

### Örnek: Yeni Bir Rule Eklemek

1. **Database Şeması Güncelle**
   ```prisma
   model TariffRule {
     ...existing fields...
     newFeature: String?  // Yeni field ekle
   }
   ```

2. **Migration Oluştur**
   ```bash
   npx prisma migrate dev --name add_new_feature
   ```

3. **Validation Schema Güncelle**
   ```typescript
   // lib/validation/schemas.ts
   export const tariffRuleSchema = z.object({
     ...existing,
     newFeature: z.string().optional(),
   })
   ```

4. **Calculation Logic Güncelle**
   ```typescript
   // lib/calculations/calculate-tariff.ts
   // calculateArdiye() fonksiyonuna yeni kural ekle
   ```

5. **Admin UI Güncelle**
   ```typescript
   // components/forms/tariff-form.tsx
   // Form field'ı ekle
   ```

6. **Test Yaz**
   ```typescript
   // Yeni senaryo test et
   ```

---

## 🔍 KURALLAR NASIL UYGULANIR?

### Veritabanı Sorgusu Sırası

1. **FreeTimeRule:** `(portId, shippingCompanyId, effectiveFrom, isActive)`
2. **TariffRule:** `(portId, shippingCompanyId, containerType, effectiveFrom, isActive)`
3. **Tarih Bazlı Filtreleme:** `effectiveFrom <= now <= effectiveUntil`
4. **En Yeni Kural:** `orderBy: { effectiveFrom: 'desc' }` (latest first)

### Uygulama Önceliği

```
1. Public API → /api/calculate
2. Validation Schemas → zod validation
3. Database Query → Prisma
4. Calculation Function → applyTieredPricing()
5. Response → charge_breakdown ile
```

---

## 💾 VERSION HISTORY

### v1.0 (Şuan)
- ✅ Temel Ardiye Hesaplama
- ✅ Kademeli Tarife (3 Tier)
- ✅ Muafiyet Kuralları
- ✅ Database-driven Configuration

### v1.1 (Planlanıyor)
- ⏳ Admin UI Completion
- ⏳ Bulk Import/Export
- ⏳ Analytics Dashboard

### v2.0 (Gelecek)
- 🔮 Container Tracking
- 🔮 Real-time Rates
- 🔮 API untuk 3rd parties

---

## 📞 NOTLAR

- **Sorun Olursa:** Yeni rule eklemesi için `BUSINESS_RULES.md`'yi güncelleyin
- **Test Etmek İçin:** `npx prisma studio`'da test verileri ekleyin
- **Sorular:** Calculation logic `/lib/calculations/calculate-tariff.ts`'e bakın

---

**Son Güncelleme:** 15.04.2026 ✅
