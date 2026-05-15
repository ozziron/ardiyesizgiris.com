# 📒 ACTIVITY LOG — ardiyesizgiris.com

> Her session sonunda yeni entry **en üste** eklenir (reverse-chronological).
> **TICKET-004'ten itibaren** ticket sistemi aktif: `tickets/` klasörü + `rules.md` + `agents/activitylogopener.md`
> Detaylı ticket kayıtları için `tickets/` klasörüne bak.

## 🔒 Okuma Protokolü (Token-Safe Bootstrap)

**Agent normal session bootstrap'ında bu dosyanın TAMAMINI okuma.** Sadece en üstteki **1–3 session entry'sini** oku (yaklaşık ilk 50–80 satır).

- Read tool kullanımı: `Read(file_path, limit=80)` veya `offset=0, limit=80`.
- 1–3 session, son bağlamı vermek için yeterlidir; daha eski kayıtlar nadiren gerekir.
- Daha eski bir entry'ye ihtiyaç olursa hedeflenmiş `offset` ile o noktadan oku — yine dosyanın tamamını yükleme.
- Control panel (`control-panel/`) tüm session'ları gösterir; bu kısıt sadece agent bootstrap içindir.

## 📦 Arşivleme Stratejisi

Bu dosya **~30 session** veya **~500 satır**'ı aştığında en eski session'lar şu konuma taşınır:

```
main/agents/archive/ACTIVITY_LOG-YYYY-QN.md
```

(örn. `ACTIVITY_LOG-2026-Q2.md` — 2026 yılı 2. çeyrek). Arşivleme manueldir; CEO/reviewer (Opus 4.7) tetikler. Arşivlenen entry'ler aynen kopyalanır, ana dosyadan silinir, ana dosyanın altına `> 📦 Daha eski session'lar: [archive/ACTIVITY_LOG-YYYY-QN.md](archive/ACTIVITY_LOG-YYYY-QN.md)` linki bırakılır. **Veri kaybı yok**, sadece bootstrap maliyeti düşer.

---

## 2026-05-15 — Session #17 — Masraf kırılım grafiği (TICKET-010)
**Agent rolü:** gemini
**Süre:** ~15dk
**Branch:** feat/ticket-010-stacked-bar-chart-cost-breakdown
**Status:** 🟡 in-review

### Yapılanlar
- Recharts ile `CostBreakdownChart` bileşeni geliştirildi.
- Maliyet kırılımını görselleştiren stacked bar chart eklendi.
- `CalculationResultCard` entegrasyonu tamamlandı.

---

## 2026-05-15 — Session #16 — /hesaplama mod seçim ekranı (TICKET-007)
**Agent rolü:** gemini
**Süre:** ~15dk
**Branch:** feat/ticket-007-mode-selection-screen
**Status:** 🟡 in-review

### Yapılanlar
- `/hesaplama` ilk açılışı için mod seçim ekranı tasarlandı.
- "Planlama yapacağım" ve "Ücret hesaplayacağım" butonları güncellendi.
- Sayfa girişi için daha açıklayıcı bir başlık ve mizanpaj eklendi.

---

## 2026-05-15 — Session #15 — Hesaplama sonuç UI iyileştirmeleri (TICKET-008)
**Agent rolü:** gemini
**Süre:** ~20dk
**Branch:** feat/ticket-008-ui-improvements-skeletons-empty-states
**Status:** 🟡 in-review

### Yapılanlar
- `CalculationResultSkeleton` bileşeni oluşturuldu.
- Ana hesaplama sayfasında loading sırasında skeleton gösterimi eklendi.
- Münferit sonuç sayfasında skeleton fallback ve iyileştirilmiş "bulunamadı" state'i eklendi.
- Tasarım tutarlılığı sağlandı.

### Etkilenen Dosyalar
- `main/components/calculation/result-skeleton.tsx` (A)
- `main/app/hesaplama/page.tsx` (M)
- `main/app/hesaplama/sonuc/page.tsx` (M)

---

## 2026-05-15 — Session #14 — Task #1 dosyaları i18n tamamlaması (TICKET-005)
**Agent rolü:** gemini
**Süre:** ~10dk
**Branch:** feat/ticket-005-i18n-cleanup-toasts
**Status:** 🟡 in-review

### Yapılanlar
- `muafiyet-kurallari` ve `ucret-tarifeleri` (liste ve edit) sayfalarındaki kalan toast `description` string'leri düzeltildi.
- Bu dosyalardaki `confirm` mesajları ve boş liste uyarıları gibi diğer ASCII string'ler temizlendi.
- `npx tsc --noEmit` ve `grep_search` ile doğrulama yapıldı.

### Etkilenen Dosyalar
- `main/app/(app)/admin/muafiyet-kurallari/page.tsx` (M)
- `main/app/(app)/admin/muafiyet-kurallari/[id]/page.tsx` (M)
- `main/app/(app)/admin/ucret-tarifeleri/page.tsx` (M)
- `main/app/(app)/admin/ucret-tarifeleri/[id]/page.tsx` (M)

---

## 2026-05-15 — Session #13 — Admin formları i18n temizliği (TICKET-004)
**Agent rolü:** gemini
**Süre:** ~15dk
**Branch:** feat/ticket-004-i18n-cleanup-admin-forms
**Status:** 🟡 in-review

### Yapılanlar
- `free-time-rule-form.tsx` ve `tariff-rule-form.tsx` dosyalarındaki ASCII-only Türkçe karakterler düzeltildi.
- `npx tsc --noEmit` ile tip kontrolü doğrulandı.
- PowerShell `Select-String` ile temizlik doğrulandı.

### Etkilenen Dosyalar
- `main/components/admin/free-time-rule-form.tsx` (M)
- `main/components/admin/tariff-rule-form.tsx` (M)

---

## 2026-05-15 — Session #12 — Masaüstü control panel başlatıcı eklendi
**Agent rolü:** workflow tooling
**Süre:** ~5dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- Masaüstüne `start-control-panel.bat` dosyası oluşturuldu.
- Batch dosyası proje klasörüne geçip Node.js kontrolü yapacak şekilde hazırlandı.
- Panel zaten çalışıyorsa sadece `http://127.0.0.1:5050` adresini açacak; çalışmıyorsa server penceresini başlatıp paneli açacak.

### Etkilenen Dosyalar
- `C:\Users\ozdem\OneDrive\Desktop\start-control-panel.bat` (A)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- Batch dosyası masaüstünde oluşturuldu ve içeriği okundu.
- Dosya yolu ve proje yolu doğrulandı.

### Sıradaki Adım
- Bilgisayar yeniden açıldıktan sonra masaüstündeki `start-control-panel.bat` çift tıklanarak panel başlatılabilir.

### Notlar / Gotcha
- Server açık kaldığı sürece görünen komut penceresi kapatılmamalı; pencere kapanırsa panel de kapanır.

---

## 2026-05-15 — Session #11 — Activity log token yönetimi ticket'ı açıldı
**Agent rolü:** workflow
**Süre:** ~5dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- Activity log büyüdükçe token kullanımını kontrol etmek için yeni backlog ticket'ı açıldı.
- `TICKET-020` self-contained hale getirildi; amaç, kapsam, kabul kriterleri, agent talimatı ve verification önerisi eklendi.

### Etkilenen Dosyalar
- `tickets/backlog/TICKET-020-activity-log-token-yonetimi-ve-arsivleme-stratejisi.md` (A/M)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- `node agents\ticket.js check` → `Ticket check passed (20 tickets)`
- Panel API counts → backlog 17, todo 0, in-review 0, done 3

### Sıradaki Adım
- Uygun bir workflow/meta session'da TICKET-020 başlatılıp activity log arşivleme ve son 1-3 session okuma stratejisi netleştirilecek.

### Notlar / Gotcha
- Bu ticket acil ürün işi değil; token hijyeni ve agent sürdürülebilirliği için P2 backlog işi olarak bırakıldı.

---

## 2026-05-15 — Session #10 — Panel prompt iptal davranışı düzeltildi
**Agent rolü:** UI tooling / bugfix
**Süre:** ~5dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- `Start` aksiyonundaki Agent prompt'unda `İptal` seçilirse ticket'ın yine de `todo`ya taşınmasına neden olan fallback davranışı düzeltildi.
- `Approve Done` prompt zincirinde de `İptal` seçilirse işlem tamamen duracak hale getirildi.
- Panel static dosyaları için `Cache-Control: no-store` eklendi; refresh sonrası eski JS'in kalması engellendi.

### Etkilenen Dosyalar
- `control-panel/public/app.js` (M)
- `control-panel/server.js` (M)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- `node --check control-panel\public\app.js` clean
- `node agents\ticket.js check` → `Ticket check passed (19 tickets)`
- `tickets/todo/` şu an boş; iptal davranışı yeni ticket başlatmadan duracak şekilde güncellendi.

### Sıradaki Adım
- Panel refresh edilerek yeni JS davranışı kullanılmalı.

### Notlar / Gotcha
- Prompt dönüşü `null` ise kullanıcı iptal etmiştir; fallback değer yalnızca boş string için bile otomatik kullanılmamalı.

---

## 2026-05-15 — Session #9 — Todo kartları için back-to-backlog ve koşullu review
**Agent rolü:** UI tooling / workflow
**Süre:** ~20dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- `todo` durumundaki ticket kartlarına `Back to Backlog` aksiyonu eklendi.
- `Move to Review` butonu review koşulları sağlanana kadar pasif hale getirildi.
- Review readiness kontrolü server tarafında `Yapılanlar`, `Etkilenen Dosyalar`, `Verification` bölümlerine göre hesaplanıp UI'a `reviewReadiness` olarak verildi.
- `agents/ticket.js` içine `backlog TICKET-XXX` komutu eklendi.
- Panel server güncel workflow koduyla yeniden başlatıldı.
- `rules.md` ve `readme.md` geri alma akışını dokümante edecek şekilde güncellendi.

### Etkilenen Dosyalar
- `agents/ticket.js` (M)
- `control-panel/server.js` (M)
- `control-panel/public/app.js` (M)
- `control-panel/public/styles.css` (M)
- `rules.md` (M)
- `readme.md` (M)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- `node --check agents\ticket.js` clean
- `node --check control-panel\server.js` clean
- `node --check control-panel\public\app.js` clean
- `node agents\ticket.js check` → `Ticket check passed (19 tickets)`
- `GET http://127.0.0.1:5050/api/state` içinde aktif `todo` ticket için `reviewReadiness.ready: false` ve eksik alanlar doğrulandı.

### Sıradaki Adım
- Tarayıcıda panel yenilenince aktif `todo` ticket altında `Back to Backlog` ve koşullu `Move to Review` görünür.

### Notlar / Gotcha
- Mevcut `TICKET-004` otomatik geri taşınmadı; kullanıcı isterse panelde `Back to Backlog` ile geri alabilir.

---

## 2026-05-15 — Session #8 — Activity ekranı session kartlarına dönüştürüldü
**Agent rolü:** UI tooling
**Süre:** ~15dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- Control panel Activity sekmesi ham log metni göstermek yerine session bazlı kart görünümüne çevrildi.
- `ACTIVITY_LOG.md` server tarafında parse edilerek `activitySessions` alanı olarak API'ye eklendi.
- Her session kartında başlık, tarih, rol, süre, branch, status, yapılanlar, etkilenen dosyalar, verification, sıradaki adım ve notlar görünür hale getirildi.
- Panel server güncel kodla yeniden başlatıldı.

### Etkilenen Dosyalar
- `control-panel/server.js` (M)
- `control-panel/public/index.html` (M)
- `control-panel/public/app.js` (M)
- `control-panel/public/styles.css` (M)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- `node --check control-panel\server.js` clean
- `node --check control-panel\public\app.js` clean
- `node agents\ticket.js check` → `Ticket check passed (19 tickets)`
- `GET http://127.0.0.1:5050/api/state` içinde `activitySessions` Session #7, #6, #5 olarak doğrulandı.

### Sıradaki Adım
- Tarayıcıda Activity sekmesi yenilenerek session kartları görülebilir.

### Notlar / Gotcha
- Ham log dosyası kaynak olarak korunuyor; UI yalnızca bu dosyayı daha okunabilir session kartlarına dönüştürüyor.

---

## 2026-05-15 — Session #7 — Yerel agent control panel kurulumu
**Agent rolü:** system setup / UI tooling
**Süre:** ~45dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- Ana siteye karışmayan ayrı `control-panel/` klasörü oluşturuldu.
- Dosya tabanlı ticket sistemini okuyan ve `agents/ticket.js` komutlarını kullanan dependency-free Node HTTP server eklendi.
- Dashboard, Tickets, CEO Review ve Activity görünümleri olan yerel panel UI eklendi.
- Panel üzerinden `check`, `sync-roadmap`, `start`, `review` ve reviewer zorunlu `done` akışları çalıştırılabilir hale getirildi.
- `readme.md` ve `setup.md` dosyalarına panelin rolü ve başlatma komutu eklendi.

### Etkilenen Dosyalar
- `control-panel/package.json` (A)
- `control-panel/server.js` (A)
- `control-panel/public/index.html` (A)
- `control-panel/public/styles.css` (A)
- `control-panel/public/app.js` (A)
- `readme.md` (M)
- `setup.md` (M)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- `node --check control-panel\server.js` clean
- `node --check control-panel\public\app.js` clean
- `node agents\ticket.js check` → `Ticket check passed (19 tickets)`
- `GET http://127.0.0.1:5050/` → `200`
- `GET http://127.0.0.1:5050/api/state` → backlog 16, todo 0, in-review 0, done 3

### Sıradaki Adım
- Panel tarayıcıdan `http://127.0.0.1:5050` adresinde kullanılabilir.
- İleride istenirse yeni proje setup'ına panel dosyalarını otomatik kopyalayan küçük scaffolding komutu eklenebilir.

### Notlar / Gotcha
- Panel source of truth değildir; kaynak gerçeklik hala `tickets/`, `agents/ACTIVITY_LOG.md`, `rules.md` ve `agents/ticket.js` dosyalarıdır.
- Worker agent yine `done` yapmamalıdır; paneldeki approve/done akışı CEO/reviewer kullanımına yöneliktir.

---

## 2026-05-15 — Session #6 — Reusable agent workflow setup rehberi
**Agent rolü:** system setup / docs
**Süre:** ~20dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- Yeni projelerde aynı manuel Paperclip-benzeri agent workflow sistemini hızlı kurmak için `setup.md` oluşturuldu.
- Rehbere dosya ağacı, dosya rolleri, minimum template'ler, ticket CLI kurulumu, ilk kurulum sırası, yeni session kullanımı ve CEO/reviewer akışı eklendi.
- Worker agent'ın `done` yapmaması ve `done` için reviewer onayı gerekliliği yeni proje setup rehberine dahil edildi.

### Etkilenen Dosyalar
- `setup.md` (A)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- `setup.md` içindeki Markdown code fence yapısı kontrol edildi.
- `node agents/ticket.js check` → `Ticket check passed (19 tickets)`

### Sıradaki Adım
- Yeni projede bu yapı kurulmak istendiğinde `setup.md` rehberi izlenecek.
- İleride istenirse bu setup rehberi bir otomatik scaffolding script'ine dönüştürülebilir.

### Notlar / Gotcha
- `agents/ticket.js` yeni projeye kopyalanırken roadmap yolu projeye göre güncellenmeli.

---

## 2026-05-15 — Session #5 — Agent workflow + self-contained ticket sistemi
**Agent rolü:** system setup / meta
**Süre:** ~2s
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- `agents/ticket.js` güçlendirildi: `new`, `start`, `review`, `done`, `check`, `sync-roadmap`, `enrich-roadmap-tickets` komutlarıyla dosya tabanlı ticket lifecycle otomasyonu kuruldu.
- Roadmap maddeleri `tickets/backlog/` altında self-contained ticket'lara dönüştürüldü; TICKET-004 ile TICKET-019 arası backlog oluşturuldu.
- Ticket içerikleri agent'ın roadmap okumadan çalışabilmesi için `Açıklama`, `Kapsam`, `Kabul Kriterleri`, `Agent Talimatı`, `Verification Önerisi` ve `Roadmap Kaynağı` bölümleriyle zenginleştirildi.
- `readme.md` tek agent giriş noktası olarak eklendi; yeni session'da agent'ın nereden başlayacağı, hangi dosyaları okuyacağı ve roadmap'i ne zaman okumayacağı netleştirildi.
- `context.md` eklendi; ürün mantığı, sabit hesaplama kuralları, veri ilkeleri, tasarım ilkeleri ve teknik sabitler roadmap'ten ayrıldı.
- `main/roadmap.md` sadeleştirildi; agent işletim rehberi olmaktan çıkarılıp stratejik backlog/sync kaynağı haline getirildi.
- `rules.md` ve `agents/activitylogopener.md` güncellendi; token tasarrufu, normal session'da roadmap okumama, roadmap sync ve self-contained ticket kuralları eklendi.
- `ticket prompt.txt` sistem parçası olarak kullanılmayacak kişisel not kabul edildi.

### Etkilenen Dosyalar
- `readme.md` (A)
- `context.md` (A)
- `agents/ticket.js` (A/M)
- `agents/package.json` (M)
- `rules.md` (M)
- `agents/activitylogopener.md` (M)
- `main/roadmap.md` (M)
- `tickets/backlog/TICKET-004...TICKET-019` (A/M)
- `tickets/done/TICKET-001...TICKET-003` (M — metadata uyumluluğu)
- `ticket prompt.txt` (M — kişisel not olarak bırakıldı)

### Verification
- `node --check agents\ticket.js` clean
- `node agents\ticket.js check` → `Ticket check passed (19 tickets)`
- `npm run ticket:check` → clean
- `node agents\ticket.js sync-roadmap main\roadmap.md --agent developer` → `Created: 0, skipped: 16`
- Fixture testleriyle `new → start → review → done → check` ve duplicate-safe roadmap sync doğrulandı.

### Sıradaki Adım
- Yeni agent session'larında sadece `readme.md dosyasını oku ve kaldığımız yerden devam et` prompt'u kullanılacak.
- Mevcut backlog'daki ilk P0 iş TICKET-004: admin form i18n cleanup.
- İleride yeni istekler için `intake` / triage komutu eklenebilir.
- Uzun vadede roadmap duplicate riskini azaltmak için stable `roadmap_id` formatı değerlendirilebilir.

### Notlar / Gotcha
- `main/roadmap.md` normal çalışma session'ında okunmayacak; ürün sabitleri `context.md`, uygulanabilir iş bağlamı ticket içinde.
- Roadmap metni değişirse `source_hash` değişebilir ve duplicate ticket riski doğabilir; mevcut sync temiz durumda.
- `todo/` klasöründe aynı anda en fazla 1 aktif ticket kuralı korunmalı.

---

## 2026-05-15 — Session #4 — Ticket sistemi kurulumu
**Agent rolü:** system setup
**Süre:** ~15dk
**Branch:** main (uncommitted)
**Status:** 🟡 in-review

### Yapılanlar
- `tickets/{backlog,todo,in-review,done}/` klasör yapısı oluşturuldu
- `rules.md` proje kökünde oluşturuldu (ticket format kuralları + şablon)
- `agents/activitylogopener.md` oluşturuldu (session bootstrap prompt'u)
- Geçmiş 3 session `tickets/done/` içine TICKET-001, 002, 003 olarak arşivlendi
- ACTIVITY_LOG.md güncellendi (ticket sistemi notu)

### Etkilenen Dosyalar
- `tickets/` (A — yeni klasör yapısı)
- `rules.md` (A)
- `agents/activitylogopener.md` (A)
- `tickets/done/TICKET-001-container-type-db.md` (A)
- `tickets/done/TICKET-002-i18n-cleanup-task1-2a.md` (A)
- `tickets/done/TICKET-003-v4-roadmap-agent-memory.md` (A)
- `agents/ACTIVITY_LOG.md` (M)

### Verification
- Klasör yapısı oluşturuldu
- Tüm dosyalar okunabilir
- TS check gerekmedi (yalnızca markdown)

### Sıradaki Adım
- TICKET-004'ü backlog'a ekle: Task #2B i18n form cleanup

---

## 2026-05-15 — Session #3 — v4 roadmap + agent memory setup
**Agent rolü:** developer (meta — kendi sistemi)
**Süre:** ~30dk
**Branch:** main (uncommitted)
**Status:** 🟡 uncommitted

### Yapılanlar
- v3 yol haritasını komple yeniden yazdım → v4.0 (session-agnostic workflow)
- `ardiyesizgiris-agents/ACTIVITY_LOG.md` oluşturuldu (bu dosya)
- `ardiyesizgiris-agents/SKILLS.md` oluşturuldu — şimdiye kadar birikmiş bilgiler kategorize edildi
- Plan dosyası: `C:\Users\ozdem\.claude\plans\starry-meandering-moth.md` (Yol Haritası v4 onaylandı)

### Etkilenen dosyalar
- `ardiyesizgiris_yol_haritasi_v3.md` (M — komple overwrite, v4 olarak)
- `ardiyesizgiris-agents/ACTIVITY_LOG.md` (A — yeni)
- `ardiyesizgiris-agents/SKILLS.md` (A — yeni)

### Verification
- v3 dosyası v4 olarak yeniden yazıldı, 9 bölüm + giriş + kurallar
- ACTIVITY_LOG ve SKILLS dosyaları erişilebilir konumda
- TS check yapılmadı (yalnızca markdown değişiklikleri)

### Sıradaki adım
- **P0 Task #2B:** `components/admin/free-time-rule-form.tsx` (~13 string) + `components/admin/tariff-rule-form.tsx` (~17 string) i18n cleanup
- Yeni session aç, Bölüm 9'daki bootstrap prompt'unu yapıştır, ben özet vereyim, sonra Task #2B'ye başla
- Gün sonu birleşik commit: Task #1 + #2A + #2B + (varsa) #2C

### Notlar / Gotcha
- v3 hesaplama algoritması v4 Bölüm 7'ye birebir taşındı (referans olarak)
- ContainerType DB tablosu artık "tamamlandı" listesinde (commit `893a49e` ile push edildi)
- gpt-oss workflow protokolü SKILLS.md'ye kaydedildi (false-report defense + 3-parçalı packet)

---

## 2026-05-15 — Session #2 — i18n cleanup Task #1 + #2A
**Agent rolü:** i18n (gpt-oss executor + Claude verifier)
**Süre:** ~45dk
**Branch:** main (uncommitted)
**Status:** 🟡 uncommitted (gün sonu push planında)

### Yapılanlar
- **Task #1:** Admin tablo sayfalarında ASCII Türkçe karakter cleanup (12 değişiklik, 4 dosya)
- **Task #2A:** Admin shell (header + sidebar) i18n cleanup (10 değişiklik, 2 dosya)
- Her iki task da gpt-oss tarafından eksik raporlandı, Claude grep ile direct inspection yapıp eksikleri tespit etti, gpt-oss düzeltme packet'ı ile tamamlandı

### Etkilenen dosyalar
- `app/(app)/admin/muafiyet-kurallari/page.tsx` (M)
- `app/(app)/admin/muafiyet-kurallari/[id]/page.tsx` (M)
- `app/(app)/admin/ucret-tarifeleri/page.tsx` (M)
- `app/(app)/admin/ucret-tarifeleri/[id]/page.tsx` (M)
- `components/admin/admin-header.tsx` (M)
- `components/admin/admin-sidebar.tsx` (M)

### Verification
- `grep -n "Tum\|Baslangic\|Bitis\|Islemler\|gun\b" <files>` → temiz
- `npx tsc --noEmit` → clean
- Görsel kontrol: yapılmadı (uncommitted, gün sonu push sonrası prod'da görülecek)

### Sıradaki adım
- Task #2B (form component'leri)
- Gün sonu birleşik commit + push

### Notlar / Gotcha
- gpt-oss 2 defa eksik raporladı (Task #1: 14 raporu ama 12 yaptı; Task #2A: 10 raporu ama 8 yaptı)
- **Ders:** Her packet sonrası grep verify zorunlu — SKILLS.md → "gpt-oss Workflow"

---

## 2026-05-15 — Session #1 — ContainerType DB-driven migration
**Agent rolü:** developer + db
**Süre:** ~2 saat
**Branch:** main
**Status:** ✅ committed (commit `893a49e`)

### Yapılanlar
- `prisma/schema.prisma`'ya `ContainerType` modeli eklendi (id, code, label, isActive, timestamps)
- Migration: `prisma migrate dev` → Neon'a uygulandı
- Public API: `GET /api/container-types` (active filter)
- Admin API: `/api/admin/container-types` CRUD (soft delete default, `?hard=true` flag)
- Admin UI: `/admin/ekipman-tipleri/{page,yeni,[id]}` sayfaları
- Shared hook: `hooks/use-container-types.ts` (`useContainerTypes()` + `resolveContainerTypeLabel()`)
- 4 consumer file (`free-time-rule-form`, `free-time-rule-bulk-form`, `tariff-rule-form`, vb.) hook'a rewire edildi
- `lib/constants/container-types.ts` silindi
- Sidebar'a "Ekipman Tipleri" entry eklendi
- Validation: `containerTypeFormSchema` ile regex `/^[A-Z0-9]+$/`

### Etkilenen dosyalar
Schema, migration, 3 API route group, 3 admin sayfa, 1 form component, 1 hook, 4 consumer, sidebar, validation schemas — toplam ~15 dosya.

### Verification
- `npx tsc --noEmit` clean
- `npm run build` smoke ok
- Vercel auto-deploy başarılı

### Sıradaki adım
- i18n cleanup (Task #1 ve sonrası)

### Notlar / Gotcha
- Soft delete default + `?hard=true` opt-in pattern başarılı → SKILLS.md → "Prisma + Neon"

---

> **Not:** Bu dosyaya yeni entry eklerken her zaman **en üste** ekle. Eski entry'ler altta kalır.
