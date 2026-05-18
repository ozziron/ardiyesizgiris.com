# 🧠 SKILLS — ardiyesizgiris.com

> Tekrar kullanılabilir teknikler, command snippet'leri, gotcha'lar.
> Kategori başlıkları altında biriktirilir. Yeni gotcha öğrenildikçe ilgili kategoriye eklenir.
> Format için Yol Haritası v4 → Bölüm 5'e bak.

---

## 🤖 Worker Agent Atama Workflow

Tüm worker CLI'lar (Claude Haiku, Gemini, Codex) için ortak risk matrisi. CLI-spesifik notlar yerine tüm worker'lar için aynı kural uygulanır; CLI farkları `BOOTSTRAP.md` §5–6'da.

**Risk matrisi (renk = atama):**

| Etki Yüzeyi | Reversible | Yarı-rev. | Irreversible |
|---|---|---|---|
| Yerel (tek dosya) | 🟢 | 🟢 | 🟡 |
| Modül (birkaç dosya) | 🟢 | 🟡 | 🔴 |
| Çapraz (schema/auth/payment/calc) | 🟡 | 🔴 | 🔴 |

- 🟢 → Worker (standart prompt + verifier checklist)
- 🟡 → Close-supervised (her commit reviewer git diff + visual smoke)
- 🔴 → CEO (Opus) / kullanıcı

**Override (her zaman 🔴, renkten bağımsız) — worker'a verme:**
- `prisma/schema.prisma`, `prisma/migrations/**`
- `lib/calculations/**` (sabit hesaplama kuralları)
- `lib/auth/**`, `middleware.ts`, `app/api/auth/**`
- Payment / Stripe / Resend production config
- DNS, `.env*`, Vercel project settings
- iOS / yeni stack başlangıçları
- Mimari karar gerektiren ticket'lar

**Whitelist (worker-uygun tipik işler):**
- i18n / copy / Türkçe karakter cleanup
- Tek dosya UI polish (skeleton, empty state, hover)
- Pure utility / helper script
- Şablon / boilerplate duplikasyonu
- Doc güncellemeleri, mevcut davranışı pin'leyen testler

**Önce-doğrula (2dk triage, ticket başına):**
1. Kapsam zaten yapıldı mı? (son 5–10 commit veya `session list`)
2. Self-contained mi? (v2 body: `Ne ve Neden` + `Nasıl Yapılır` dolu mu)
3. Renk + override kontrolü.

**Reviewer verifier checklist (her ticket sonu):**
1. `node main/agents/ticket.js check` → 0 uyarı
2. Frontmatter `status: in-review`, `sessions: [...]` dolu (session start ile otomatik)
3. v2 body: `Sonuç` + `Etkilenen Dosyalar` boş değil
4. **Grep verify** (gpt-oss dersi) — iddia edilen değişiklikler gerçekten yapılmış mı
5. `cd main && npm run typecheck` exit 0
6. UI etkisi varsa `npm run build` veya görsel smoke (🟡'da zorunlu)
7. İlgili session dosyasında commit hash + verification çıktısı yer alıyor
8. `node main/agents/ticket.js done TICKET-XXX --commit <hash> --reviewer opus`

**Disiplin:**
- `todo/` max 1 ticket per assignee. Paralel yok.
- Session başında `ticket.js session start --tickets ...`, sonunda `session end`. Tek ACTIVITY_LOG'a yazma yasak.
- `in-review`'a almadan önce commit zorunlu ("uncommitted" gotcha tekrar etmesin).
- Worker 2. iterasyonda da bitiremezse → eskale (CEO (Opus)).

---

## 🔨 Build & Deploy

- **Vercel auto-deploy:** main'e push → ~2-3dk içinde live. Status: https://vercel.com/dashboard
- **`npx tsc --noEmit`** build'den çok daha hızlı, syntax + tip kontrolü için yeter. Build'i bekleme — geliştirme sırasında bunu kullan.
- **`npm run build`** sadece deploy öncesi smoke test için (full bundle).
- **Env değişkenleri** Vercel dashboard'dan eklenir (Project Settings → Environment Variables). `.env.local` sadece dev içindir, prod'a etki etmez.
- **Vercel preview deploy:** her PR otomatik preview URL alır (`<branch>-<project>.vercel.app`).
- **Rollback:** Vercel dashboard → Deployments → önceki successful → "Promote to Production".

---

## 🗄️ Prisma + Neon

- **DATABASE_URL** Neon'a bağlı (local Postgres yok). `prisma migrate dev` Neon'a yazıyor — dikkat.
- **Migration adımları:**
  1. `prisma/schema.prisma` düzenle
  2. `npx prisma migrate dev --name <slug>` → migration oluştur + Neon'a uygula
  3. `npx prisma generate` → client tiplerini güncelle (otomatik tetiklenir ama emin ol)
- **Soft delete pattern (ContainerType örneği):**
  - Default DELETE → `isActive = false` (soft)
  - `?hard=true` query → gerçek DELETE
  - Liste endpoint'i default `isActive: true` filter
- **Singleton client:** `lib/db/prisma.ts` — Next.js hot-reload sırasında multiple instance oluşmasın diye global cache.
- **Decimal handling:** Prisma Decimal'i JS Number'a `Number(value)` ile çevir, hesaplamada precision kaybı olabilir — gerekirse `decimal.js`'e dönüş gerekir.

---

## 🌐 i18n (Türkçe Diacritics Cleanup)

- **Şüpheli ASCII pattern'leri:**
  ```
  Tum → Tüm
  Baslangic → Başlangıç
  Bitis → Bitiş
  Islemler → İşlemler
  Iptal → İptal
  Cikis → Çıkış
  gun → gün
  secin → seçin
  Don → Dön (Geri Don → Geri Dön)
  yuklenemedi → yüklenemedi
  basarisiz → başarısız
  basarili → başarılı
  aciklama → açıklama
  yonetim → yönetim
  ```
- **Verify komutu:**
  ```powershell
  grep -n "Tum\|Baslangic\|Bitis\|Islemler\|Iptal\|Cikis\|\bgun\b\|secin\|Don\|yuklenemedi\|basarisiz\|aciklama" <file>
  ```
- **React component'lerinde 3 yer Türkçe içerebilir:**
  1. Ekran metni (JSX text node)
  2. `placeholder=""` prop
  3. Toast `description` / `title`
- **Atlama riski:** gpt-oss/Codex bu tarz toplu değişikliklerde sıklıkla atlar (Task #1: 14 sözü, 12 yaptı; Task #2A: 10 sözü, 8 yaptı). **Direct inspection ile verify zorunlu.**

---

## 🤖 gpt-oss / Codex Workflow

**Üç-parçalı packet protokolü:**
- **A) PROMPT PACKET** — gpt-oss'a kopya-yapıştır. İçerir:
  - Görev tanımı
  - **Dokunulacak dosya listesi** (explicit)
  - **DOKUNMA listesi** (uncommitted dosyalar, başka task'a ait alanlar)
  - **KESİN KURALLAR:** git/npm komutu YOK, başka dosya YOK
  - ESKİ → YENİ format her değişiklik için
  - Rapor formatı (gpt-oss takip etmek zorunda)
- **B) VERIFY** — Claude lokal çalıştırır:
  - `git diff <files>` → satır satır kontrol
  - `grep -n "<patterns>" <files>` → eksik var mı
  - `npx tsc --noEmit` → tip kontrolü
- **C) REPORT FORMAT** — gpt-oss şunu döner: değiştirilen dosya sayısı, her dosyada satır numarası + ESKİ → YENİ.

**Kural:** gpt-oss raporuna asla güvenme. **Her zaman direct file inspection.** False-report 2 defa yaşandı (Task #1, #2A).

**Atlamayı azaltma:**
- Packet'i küçük tut (2-4 dosya max)
- Her ESKİ string'in **eşsiz** olduğundan emin ol (duplicate varsa atlama daha kolay)
- ESKİ string'lerde whitespace'i birebir koru

---

## 🔐 NextAuth v5 (beta)

- **Server component:** `import { auth } from "@/lib/auth/auth"` → `const session = await auth()`
- **Client component:** `useSession()` + `<SessionProvider>` wrap (root layout)
- **Role guard:** İki katmanlı:
  1. `middleware.ts` → matcher ile `/admin/*` korur, role check yapar
  2. Admin layout veya server action içinde `auth()` ile çift kontrol
- **Session callback:** `lib/auth/auth.ts` içinde `session({ session, token })` → role'ü session.user'a inject et
- **Beta gotcha:** v5 API'si v4'ten farklı, dökümanı her zaman authjs.dev/getting-started/migrating-to-v5 üzerinden kontrol et.

---

## 📄 PDF + Email

### PDF (jsPDF)
- **Inter font embed zorunlu** — yoksa Türkçe karakterler boş kutu çıkar.
- Font dosyaları: `lib/pdf/fonts/Inter-Regular.ttf` + `Inter-Bold.ttf` base64 encoded.
- Embed: `doc.addFileToVFS("Inter-Regular.ttf", interRegularBase64); doc.addFont("Inter-Regular.ttf", "Inter", "normal");`
- Page setup: A4, mm units, margins 20mm.

### Email (Resend)
- **Durum:** `not_configured` — domain verify edilmedi, prod env'de RESEND_API_KEY yok
- API yanıtı: 503 Service Unavailable + `{ error: "Email service not configured" }` body
- UI tarafı bu durumu graceful handle ediyor (toast: "Email gönderme yakında aktif olacak")
- **Çözüm yolu:** Resend dashboard → domain ekle → DNS records → verify → Vercel env'e `RESEND_API_KEY` ekle

---

## 🎨 Brand & Design System

- **Primary color:** `hsl(160 84% 39%)` → Emerald 600 (Tailwind)
- **Fontlar:** Inter (body) + Inter Tight (display/heading)
- **Border radius:** 0.5rem default (shadcn/ui)
- **Dark mode:** `next-themes` ile, manuel toggle yok (system preference)
- **Custom logo:** `components/brand/logo.tsx` + `wordmark.tsx` (SVG)
- **Hero illustration:** `components/hero-illustration.tsx` (custom SVG)
- **Konteyner renkleri (timeline için):** green, brown, red, blue (tailwind.config.ts)

---

## 🧪 Hesaplama Formülü (Hatırlatıcı)

- `free_until = departure - free_days + 1` (departure dahil olduğu için +1)
- `total_days = (departure - gate_in) + 1` (her iki gün dahil)
- `chargeable = gate_in >= free_until ? 0 : total_days - free_days`
- Tier1 → Tier2 → Tier3 sırayla uygulanır (`tier1DaysTo`, `tier2DaysTo` cap'leri ile)
- date-fns `differenceInCalendarDays(a, b)` kullanılır (gün farkı, +1 ekleyerek inclusive yap)

---

## 🛠️ Git Workflow

- **Default branch:** `main`
- **Feature branch convention:** `feat/ticket-<NNN>-<slug>` (örn. `feat/ticket-007-mode-selection-screen`). Eski `agent/<role>/<slug>` formatı bırakıldı.
- **Commit format:** `<type>(<scope>): <imperative description>`
  - type: feat | fix | refactor | chore | docs | style
- **Co-Author:** `Co-Authored-By: Claude CEO (Opus) <noreply@anthropic.com>` (Claude Code default)
- **Push policy:** GitHub push **yalnızca CEO (Opus)** yapar. Worker agent'lar (Gemini, Codex, Claude Haiku) commit atar, push'lamaz.
- **Batch push:** Bireysel ticket push edilmez. Tüm `tickets/in-review/` birikip Push ticket'ı (her roadmap'in son task'i, `assignee: opus`) altında tek seferde push edilir; ticket'lar `in-review → done` doğrudan atlanır (v2'de `approved` ara durumu kaldırıldı).
- **PR review:** Bu projede şu an PR akışı değil, doğrudan main'e merge + push kullanılıyor.
- **Force push:** YASAK (main'e), feature branch'e bile sorgula.

---

## 🔁 4-Statüülü Ticket Akışı (Multi-Agent + Push Ayrımı)

```
backlog → todo → in-review → done
                  (worker)    (Opus review + batch push)
```

- **`in-review` → `done`:** CEO (Opus) yetkisi. Her ticket onay sorulmadan değerlendirilir; kriterler tamamsa batch push edilip done'a alınır. (v2'de `approved` ara durumu kaldırıldı — pratikte hiç kullanılmıyordu.)
- Worker agent'lar `in-review`'dan ileri taşıyamaz. Bu `rules.md`'de governance kuralı olarak yazılı.
- Frontmatter `status` her zaman bulunduğu klasörle aynı olmalı; `ticket check` bunu doğrular.

### Push Ticket Pattern
Her roadmap iterasyonunun **son task'i** zorunlu Push ticket'ı olmalı:
- `assignee: opus`, `type: chore`, `priority: P0`
- Kapsam runtime'da `in-review/` ne içeriyorsa
- `in-review/` boşsa skip
- Adımlar: branch'leri yerel main'e merge → conflict resolve → `git push origin main` tek seferde → ticket'ları `in-review/` → `done/` taşı + frontmatter `commit` + `Kapanış`.

### Merge Sıralaması (batch push)
1. **Foundational/strüktürel** önce (örn. 022 agents/ taşıması) — sonraki branch'lerin base'i.
2. **Bağımlı branch'ler** (foundational üzerine kurulu olanlar, örn. 020/015) hemen ardından.
3. **Bağımsız feature/fix'ler** sırayla.
4. **Çakışan dosyaya dokunanlar** en sona (örn. header.tsx'e nav link ekleyen iki ticket: ikincisinde conflict çıkar, yan yana koy).
5. Schema değişikliği yapan branch'ler için `git merge-base` ile şüpheli kombinasyonları önceden kontrol et — bir branch diğerini base alıyorsa conflict olmaz.

---

## 🌳 Repo Boundary Gotcha (workspace ≠ git root)

Bu projede `main/` klasörü tek git repo'sudur. Workspace root'ta (`ardiyesizgiris.com/`) **git tracked olmayan** dosya/klasörler bulunur: `tickets/`, `control-panel/`, `readme.md`, `rules.md`, `context.md`, `setup.md`, `GEMINI.md`.

**Sonuç:** Agent'lar bu sınırı bilmezse:
- Branch açar, dosyaları workspace root'a yazar, "commit" atar — **commit boş** kalır.
- Verification PASS bildirir, ama git'te kayıt yok.
- TICKET-012/013/014 bu şekilde yaşandı: Codex `agents/` klasöründe (workspace root) çalıştı, branch'leri main'e merge edilemedi.

**Çözüm (TICKET-022 ile uygulandı):** `agents/` `main/agents/`'a taşındı. Yine de bu sınır mevcut — yeni iş öncesi: dosya `main/` altında mı?

**Path constants tuzakları:** Taşıma sonrası `ticket.js` (`repoRoot = path.resolve(__dirname, "..")` → `..`/`..`), `activity-log-from-commits.js` ve `package.json` script path'leri güncellenmeli. Control-panel da `ticketCli` ve `ACTIVITY_LOG.md` path'lerini günceller.

---

## 🪢 Merge Conflict — Sık Karşılaşılan Pattern'ler

**Additive list conflict (nav links, env vars):**
Aynı insertion point'e iki branch eklediğinde git auto-merge başarısız olur. Resolution: ikisini de tut, sıralı koy. Örn:
- `components/layout/header.tsx`: 017 `/takip` + 018 `/kurumsal` — yan yana iki Link
- `.env.example`: 016 Stripe block + 017 Tracking block — peş peşe iki blok

**🚨 Gotcha — `git add` ile çakışma markeri:**
`git add <file>` çakışma markeri (`<<<<<<<`, `=======`, `>>>>>>>`) içerirken bile başarılı olur. Sonra `git commit` markerlerle commit yapar — gözden kaçar.

**Kural:** Conflict resolve sonrası, **`git add` öncesi** mutlaka:
```bash
grep -c "<<<<<<" <file>   # 0 olmalı
```
veya
```bash
git diff --check
```

**Edit tool ile resolve:** Edit kullanmadan önce Read çağrılı olmalı (harness gereği). Bash ile dosya görüntüleme Edit hakkı vermez.

---

---

## 🧰 Useful Commands

```powershell
# Çalışma dizini
cd C:\Users\ozdem\OneDrive\Desktop\ardiyesizgiris.com\ardiyesizgiris.com-main

# Dev server
pnpm dev

# Type check (hızlı)
npx tsc --noEmit

# Build smoke
npm run build

# Prisma
npx prisma migrate dev --name <slug>
npx prisma generate
npx prisma studio    # GUI

# Git
git status
git log --oneline -5
git diff <file>

# Agent CLI
cd C:\Users\ozdem\OneDrive\Desktop\ardiyesizgiris.com\ardiyesizgiris-agents
node cli.js
```

---

## 📝 Lessons Learned (Cross-cutting)

- **Tek session = bağımlılık.** Context-bloat → /compact → kayıp. Çözüm: her görev için `ticket.js session start/end`; iz session dosyasında kalır (`main/agents/sessions/`).
- **gpt-oss raporu ≠ gerçek.** Her zaman direct file inspection ile verify.
- **Paperclip experiment başarısız oldu** — yerine custom `ardiyesizgiris-agents` Node sistemi + Claude Code Agent tool kombinasyonu kullanılıyor.
- **DB-driven > hardcoded.** ContainerType migration örneği başarılı (constants → Prisma + admin CRUD).
- **i18n cleanup atlama riski yüksek.** Küçük packet + grep verify + correction round'lara hazırlıklı ol.
- **Worker agent commit boş kalabilir** (TICKET-012/013/014). Branch + commit oluştu raporu yetmiyor — `git show --stat <sha>` ile gerçekten dosya değişti mi kontrol et. Sıfır satır = boş commit = workspace/git sınır hatası.
- **Architecture decision ticket'ları kod değil ADR ister.** TICKET-015 (iOS) doğru cevap iOS scaffold değil, MOBILE_STRATEGY.md ADR + DeveloperAgent template temizliği oldu. "Mimari karar gerekiyor" ticket'larında önce karar/değerlendirme, gerekirse sonra implementation ticket'ı aç.
- **Inherited agent templates dikkatlice audit edilmeli.** `DeveloperAgent.planMobileFeature` "VisionCam AI iOS app + SwiftUI + Core ML" referansı taşıyordu — başka projeden devralınmış ölü kod. Şüpheli iş çıkarmadan önce agent şablonlarını proje bağlamına göre dezenfekte et.
- **Token-safe bootstrap kuralı redundant olmalı (çözüldü).** ACTIVITY_LOG read sınırı eskiden üç yerde belirtiliyordu (dosyanın kendi üst başlığı + readme.md + activitylogopener.md), tek yerdeki kural kaçırılıyordu. v2'de ACTIVITY_LOG.md kaldırıldı, kural tek kaynakta: `BOOTSTRAP.md` §4 → `sessions/INDEX.md` okuma sınırı.
- **Status alanı eklerken iki tarafı güncelle:** Control panel hem `server.js` (`statuses` array) hem `public/app.js` (`statusLabels` object) hardcoded liste tutuyor. v2'de `approved` kaldırıldığında bu iki tarafın da elle güncellenmesi gerekiyor (henüz yapılmadı; ayrı bir ticket'ta ele alınacak). Yeni statü eklerken de aynı kural geçerli.
- **Push merge sırası matters.** Aynı dosyaya dokunan iki branch varsa ikincisini en sona bırak — conflict her halükarda çıkar ama en az komşu commit'i etkiler.

---

> **Not:** Bu dosyaya yeni bilgi eklerken doğru kategoriye yerleştir. Kategori yoksa yeni kategori aç. Eski bilgi yanlışsa düzelt (rotation > append).
