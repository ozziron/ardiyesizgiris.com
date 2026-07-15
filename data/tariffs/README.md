# Carrier Tariff Packs

Bir JSON dosyası = bir armatörün tüm ardiye tarife verisi. Bu klasör,
armatör verilerinin DB'ye girmeden önceki **tek doğruluk kaynağıdır** ve
`database` agent'ın çalışma alanıdır.

## Akış

```
PDF / ekran görüntüsü / e-posta / web sayfası
        │  /agent database "X tarifesini işle"
        ▼
data/tariffs/<code>.json   (verified: false)
        │  npm run db:import-tariffs -- data/tariffs/<code>.json          ← DRY-RUN raporu
        ▼
kullanıcı raporu inceler, ONAYLAR → verified: true
        │  npm run db:import-tariffs -- data/tariffs/<code>.json --apply [--db prod]
        ▼
DB (önce dev, sonra prod) + apply sonrası smoke test
```

## Komutlar

Çalışma dizini `main/`:

```powershell
# Dry-run (varsayılan — hiçbir şey yazmaz, CREATE/UPDATE/UNCHANGED raporu basar)
npm run db:import-tariffs -- data/tariffs/mscu.json

# Canlı DB'ye karşı dry-run
npm run db:import-tariffs -- data/tariffs/mscu.json --db prod

# Uygulama (yalnızca verified: true pack'lerde çalışır)
npm run db:import-tariffs -- data/tariffs/mscu.json --apply --db prod

# DB'deki mevcut veriyi pack'e dök (envanter / yedek / regresyon kanıtı)
npm run db:export-tariffs -- --carrier MAEU --db prod
```

Bayraklar:
- `--create-taxonomy` — pack'te olup DB'de olmayan liman/tip oluşturulmasına izin verir (bilinçli karar; `coverage.portDefs` / `containerTypeDefs` tanımları gerekir)
- `--strict-notes` — `notes` alanını da diff'e dahil eder (varsayılan: hariç)
- `--out <dosya>` — export çıktı yolu

`--db prod` için `main/.env.production-db` gerekir (gitignore kapsamında):
`vercel env pull .env.production-db --environment=production`

## Format kuralları

- **Kimlik daima `code` iledir** (liman kodu, armatör kodu, tip kodu) — id'ler
  ortamlar arasında farklıdır, asla kullanılmaz.
- **Tier'lar**: 1-3 adet, 1. günden başlar, bitişik artan; **son tier açık uçlu**
  (`"to": null`). Hesaplama motoru son aktif tier'ı açık uçlu saydığı için bu zorunludur.
- `tier` fiyatı 0 = o aralık ücretsiz (free time).
- **4+ tier'lı tarifeler şemaya sığmaz**: fazla tier'lar muhafazakâr birleştirilir
  (yüksek fiyat alınır — site asla düşük tahmin vermemeli), orijinal tablo
  `meta.notes`'a yazılır ve kullanıcı onayında açıkça belirtilir.
- **Kapsam matrisi**: hedef DB'deki her (aktif liman × aktif tip) ya bir
  `ruleGroups` kaydında ya da `coverage.exceptions`'ta (gerekçeli) olmalıdır.
  Eksik kombinasyon sitede "tarife bulunamadı" hatası verir; import bunu engeller.
- **`meta.verified`**: yalnızca kullanıcı onayıyla `true` yapılır. `--apply` bunu
  şart koşar. Web kaynaklı taslaklar (`source: "web-draft"`) doğrulanana kadar
  `false` kalır.
- **Kaynak dokümanlar** (PDF/ekran görüntüsü): `data/tariffs/sources/<CODE>/`
  altında saklanır. `.gitignore`'daki `*.pdf` kuralı gereği versiyonlanmazlar —
  yalnızca lokal kanıttır; kalıcı referans `meta.sourceRef` alanına yazılır.

## Örnek iskelet

```jsonc
{
  "carrier": { "code": "MSCU", "name": "MSC" },
  "meta": {
    "source": "user-pdf",            // user-pdf | user-screenshot | user-email | web-draft | prod-export
    "sourceRef": "MSC TR ihracat ardiye tarifesi 2026.pdf",
    "receivedAt": "2026-07-15",
    "verified": false,
    "notes": "Günler takvim günü varsayıldı; kaynakta belirtilmemiş."
  },
  "defaults": { "currency": "USD", "effectiveFrom": "2026-01-01", "effectiveUntil": null },
  "surcharges": [],
  "coverage": {
    "ports": ["IST-KUMPORT", "IST-MARPORT"],
    "exceptions": [
      { "port": "ISK-LIMAKPORT", "containerType": "*", "reason": "MSC İskenderun'a uğramıyor" }
    ],
    "portDefs": [], "containerTypeDefs": []
  },
  "ruleGroups": [
    {
      "name": "Dry",
      "containerTypes": ["20DC", "40DC", "40HC"],
      "imoCargo": false,
      "ports": {
        "IST-KUMPORT": {
          "tiers": [
            { "from": 1, "to": 8,  "prices": { "20DC": 0,  "40DC": 0,  "40HC": 0 } },
            { "from": 9, "to": 14, "prices": { "20DC": 15, "40DC": 30, "40HC": 30 } },
            { "from": 15, "to": null, "prices": { "20DC": 30, "40DC": 60, "40HC": 60 } }
          ]
        }
      }
    }
  ]
}
```

Şema tanımı: `main/lib/tariffs/pack-schema.ts` · Kolon eşlemesi: `main/lib/tariffs/expand.ts`
