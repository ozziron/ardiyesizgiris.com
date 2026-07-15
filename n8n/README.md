# n8n Otomasyon Workflow'ları

Bu dizin, ardiyesizgiris.com için n8n otomasyon workflow'larını içerir.

## Kurulum

```powershell
# n8n'i başlat (yerel geliştirme)
npx n8n
# → http://localhost:5678

# n8n-as-code ile versiyonlama (opsiyonel)
npx n8n-as-code pull   # n8n instance'dan workflow'ları çek
npx n8n-as-code push   # git'teki workflow'ları instance'a yükle
```

## Mevcut Workflow'lar

| Workflow | Dosya | Amaç |
|---|---|---|
| CI/CD Bildirim | `ci-cd-notify.json` | Vercel deploy → Slack/Discord bildirimi |
| Sağlık Kontrolü | `health-check.json` | Saatlik site + API ping kontrolü |
| DB Yedekleme | `db-backup-reminder.json` | Haftalık Neon backup hatırlatması |

## CI/CD Bildirim Hattı

```
GitHub Push → Vercel Build → n8n Webhook → Slack/Discord mesajı
```

**Gerekenler:**
- Slack/Discord webhook URL'si
- Vercel Deploy Hook (veya GitHub webhook)

**Kurulum:**
1. n8n'de yeni workflow oluştur
2. Webhook node ekle (POST endpoint)
3. Vercel'de Deploy Hook oluştur → webhook URL'sini yapıştır
4. Slack/Discord node ekle → mesaj formatını ayarla
5. Test et: manuel deploy tetikle → bildirim gelsin

## Sağlık Kontrolü

```
n8n Cron (saatte 1) → HTTP Request → ardiyesizgiris.com
                                    → /api/ports (API check)
                   → Başarısızsa → Slack uyarısı
```

**Kurulum:**
1. Schedule trigger (her saat)
2. HTTP Request node: `https://ardiyesizgiris.com`
3. HTTP Request node: `https://ardiyesizgiris.com/api/ports`
4. IF node: response code ≠ 200 → Slack bildirimi
5. IF node: response code = 200 → Google Sheets log (opsiyonel)

## DB Yedekleme Hatırlatıcı

```
n8n Cron (Pazartesi 09:00) → Slack mesajı
```

Basit zamanlanmış hatırlatma. Neon dashboard'dan manuel backup alınır.

## Kaynaklar

- [n8n.io/workflows](https://n8n.io/workflows/) — 10,500+ hazır workflow
- [n8n-as-code](https://github.com/EtienneLescot/n8n-as-code) — GitOps ile workflow yönetimi
- [n8n docs](https://docs.n8n.io/) — Resmi dokümantasyon
