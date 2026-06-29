<#
.SYNOPSIS
  Windows Prisma DLL kilitlenmesini çözer.
  npm install/postinstall sırasında EPERM hatası alındığında çalıştırın.

.DESCRIPTION
  Bu script:
  1. Bu repo altında çalışan tüm Node süreçlerini listeler
  2. İsteğe bağlı olarak bu süreçleri sonlandırır
  3. Stale .tmp dosyalarını temizler
  4. prisma generate çalıştırır

  Çalıştırmadan önce tüm terminal/editor pencerelerini kapatmanız önerilir.
#>

param(
    [switch]$ForceKill,
    [switch]$SkipGenerate
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== Prisma DLL Lock Fix ===" -ForegroundColor Cyan
Write-Host "Repo: $RepoRoot`n"

# 1. Bu repo dizininde çalışan Node süreçlerini bul
Write-Host "[1/4] Node surecleri taranıyor..." -ForegroundColor Yellow

$allNodeProcs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Select-Object ProcessId, CommandLine, CreationDate

$repoProcs = $allNodeProcs | Where-Object {
    $_.CommandLine -and $_.CommandLine -like "*ardiyesizgiris*"
}

if ($repoProcs) {
    Write-Host "  Bu repoya ait Node surecleri:" -ForegroundColor Red
    $repoProcs | ForEach-Object {
        $cmd = if ($_.CommandLine.Length -gt 120) { $_.CommandLine.Substring(0, 117) + "..." } else { $_.CommandLine }
        Write-Host "    PID $($_.ProcessId) - Baslangic: $($_.CreationDate) - $cmd"
    }
} else {
    Write-Host "  Bu repoya ait Node sureci bulunamadı." -ForegroundColor Green
}

# 2. Port 3456'yı kontrol et
Write-Host "`n[2/4] Port 3456 kontrol ediliyor..." -ForegroundColor Yellow
$portConn = Get-NetTCPConnection -LocalPort 3456 -ErrorAction SilentlyContinue
if ($portConn) {
    $proc = Get-Process -Id $portConn.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "  Port 3456 PID $($portConn.OwningProcess) ($($proc.ProcessName)) tarafindan kullaniliyor." -ForegroundColor Red
} else {
    Write-Host "  Port 3456 bos." -ForegroundColor Green
}

# 3. Kullanıcı onayı ile süreçleri sonlandır
if (-not $ForceKill -and $repoProcs) {
    $answer = Read-Host "`nBu repoya ait TUM Node sureclerini sonlandirilsin mi? (e/h)"
    if ($answer -ne 'e') {
        Write-Host "Iptal edildi. Once Node sureclerini elle kapatin, sonra tekrar calistirin." -ForegroundColor Red
        exit 1
    }
}

if ($repoProcs) {
    Write-Host "`n  Surecler sonlandiriliyor..." -ForegroundColor Yellow
    $repoProcs | ForEach-Object {
        try {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
            Write-Host "    PID $($_.ProcessId) sonlandirildi." -ForegroundColor Green
        } catch {
            Write-Host "    PID $($_.ProcessId) sonlandirilamadi: $_" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
}

# 4. Stale .tmp dosyalarını temizle
Write-Host "`n[3/4] Stale .tmp dosyalari temizleniyor..." -ForegroundColor Yellow
$prismaClientDir = Join-Path $RepoRoot "node_modules\.prisma\client"
if (Test-Path $prismaClientDir) {
    $tmpFiles = Get-ChildItem $prismaClientDir -Filter "*.tmp*" -ErrorAction SilentlyContinue
    if ($tmpFiles) {
        $tmpFiles | ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Host "  Silindi: $($_.Name)" -ForegroundColor Green
        }
    } else {
        Write-Host "  Temizlenecek .tmp dosyasi yok." -ForegroundColor Green
    }
} else {
    Write-Host "  .prisma/client dizini bulunamadı." -ForegroundColor Yellow
}

# 5. prisma generate
if (-not $SkipGenerate) {
    Write-Host "`n[4/4] prisma generate calistiriliyor..." -ForegroundColor Yellow
    Push-Location $RepoRoot
    try {
        npx prisma generate
        Write-Host "`n=== Basariyla tamamlandi! ===" -ForegroundColor Green
        Write-Host "Artik 'npm run dev' ile gelistirme sunucusunu baslatabilirsiniz."
    } catch {
        Write-Host "`nprisma generate basarisiz oldu." -ForegroundColor Red
        Write-Host "Tum Node sureclerinin kapali oldugundan emin olup tekrar deneyin."
        Write-Host "Gerekirse bilgisayari yeniden baslatip sadece bu scripti calistirin."
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`nprisma generate atlandi. Elle calistirmak icin: npx prisma generate" -ForegroundColor Yellow
}
