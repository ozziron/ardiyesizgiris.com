# activitylogopener

Session başlatma agent'ı. Her yeni çalışma session'ında bu prompt'u kullan.

---

## Kullanım

Yeni bir Claude Code session'ı açtığında bu dosyayı oku ve aşağıdaki adımları uygula.

---

## Session Bootstrap Adımları

### 1. Kuralları Yükle
`rules.md` dosyasını oku. Tüm session boyunca bu kurallara göre çalış.

### 2. Ticket Seç
- `tickets/todo/` içinde aktif ticket varsa onu devam ettir.
- Aktif ticket yoksa `tickets/backlog/` klasörüne bak.
- Normal çalışma session'ında `main/roadmap.md` okuma; token tasarrufu için ticket self-contained olmalıdır.
- Backlog boşsa, kullanıcı roadmap sync isterse veya roadmap güncellendiyse sync/meta agent olarak `main/roadmap.md` dosyasını oku ve `node agents/ticket.js sync-roadmap main/roadmap.md --agent <agent-adı>` çalıştır.
- Kullanıcı bir ticket belirtmişse onu al.
- Belirtmemişse priority sırasına göre (`P0` önce, sonra `P1`, `P2`, `P3`; aynı priority içinde en düşük numara) ilk ticket'ı öner veya başlat.

### 3. Ticket'ı Aktifleştir
- Önce `node agents/ticket.js check` çalıştır; mevcut sistem sağlıklı değilse kullanıcıya raporla.
- `tickets/todo/` içinde aktif ticket varsa yeni ticket başlatma.
- Seçilen ticket dosyasını mümkünse `node agents/ticket.js start TICKET-NNN --agent <agent-adı>` ile `tickets/todo/` klasörüne taşı.
- Manuel taşıma gerekiyorsa frontmatter'daki `status` alanını `todo` yap.
- `date` alanını bugünün tarihiyle güncelle.
- `agent` alanını bu session'ın agent adıyla güncelle.

### 4. Çalış
Ticket'ın Açıklama bölümüne göre işi yap.
Ticket'ta `Kapsam`, `Kabul Kriterleri`, `Agent Talimatı` ve `Verification Önerisi` varsa bunları esas al; roadmap'i tekrar açma.
Yapılanları, etkilenen dosyaları ve doğrulama adımlarını kaydet.

### 5. Session Bitiminde Ticket'ı Güncelle
Şu alanları doldur:
- `Yapılanlar` — madde madde tamamlanan her iş
- `Etkilenen Dosyalar` — A/M/D etiketiyle
- `Verification` — çalıştırılan komutlar, test sonuçları
- `Sıradaki Adım` — bir sonraki session için bırakılan iş

### 6. Statüyü in-review'a Al
- `Yapılanlar`, `Etkilenen Dosyalar` ve `Verification` alanlarının dolu olduğundan emin ol.
- Mümkünse `node agents/ticket.js review TICKET-NNN` kullan.
- Manuel taşıma gerekiyorsa frontmatter'daki `status` alanını `in-review` yap ve dosyayı `tickets/in-review/` klasörüne taşı.

### 7. ACTIVITY_LOG.md'yi Güncelle
`agents/ACTIVITY_LOG.md` dosyasına en üste yeni entry ekle.
Mevcut format korunacak (reverse-chronological, başlık + madde listesi).

---

## GitHub Push Sonrası (Manuel)

Worker agent bu bölümü kendiliğinden uygulamaz. Bu bölüm yalnızca kullanıcı veya CEO/reviewer rolündeki Opus 4.7 onayı sonrası uygulanır.

Kullanıcı veya Opus 4.7 kodu inceleyip onayladıktan sonra:
1. Mümkünse `node agents/ticket.js done TICKET-NNN --commit <hash> --reviewer opus-4.7` kullan.
2. Commit yoksa `node agents/ticket.js done TICKET-NNN --note "Kapanış notu" --reviewer opus-4.7` kullan.
3. Manuel taşıma gerekiyorsa ticket dosyasını `tickets/in-review/` → `tickets/done/` klasörüne taşı.
4. Frontmatter'daki `status` alanını `done`, `reviewer` alanını onay veren reviewer adı yap.
5. `ACTIVITY_LOG.md`'deki ilgili entry'nin status satırını `✅ done` olarak güncelle.

---

## Yeni Ticket Oluşturma (Backlog'a Eklemek İçin)

```
1. tickets/ altındaki tüm klasörlerde en yüksek TICKET-NNN numarasını bul
2. Bir artır → yeni NNN
3. rules.md'deki şablonu kullanarak TICKET-{NNN}-{slug}.md dosyasını oluştur
4. tickets/backlog/ klasörüne kaydet
5. status: backlog olarak işaretle
```

Önerilen komut:

```powershell
node agents/ticket.js new "Başlık" --priority P2 --type feature --agent developer
```

---

## Roadmap'ten Ticket Üretme

Roadmap sync yalnızca backlog üretmek veya roadmap güncellemesini ticket'lara yansıtmak için kullanılır. Normal çalışma agent'ları roadmap okumaz.

Roadmap ana kaynaksa manuel ticket yazma. Sync/meta agent şu komutu kullanır:

```powershell
node agents/ticket.js sync-roadmap main/roadmap.md --agent developer
```

Bu komut `main/roadmap.md` içindeki `- [ ]` maddeleri okur, mevcut ticket'larla duplicate kontrolü yapar ve eksik işleri self-contained backlog ticket'ı olarak ekler.
Ticket açıklamaları zayıfsa şu komutla mevcut roadmap ticket'larını zenginleştir:

```powershell
node agents/ticket.js enrich-roadmap-tickets main/roadmap.md --agent developer --force
```
