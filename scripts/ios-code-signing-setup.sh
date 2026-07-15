#!/usr/bin/env bash
# iOS Code Signing Setup — ardiyesizgiris.com
#
# macOS'te çalıştırılır. Apple Developer hesabı ve App Store Connect API
# anahtarı gerektirir. Adım adım Fastlane Match kurulumunu yapar.
#
# Kullanım:
#   chmod +x scripts/ios-code-signing-setup.sh
#   ./scripts/ios-code-signing-setup.sh
#
# Gereksinimler:
#   - macOS (Apple Silicon veya Intel)
#   - Ruby 3.2+ (ruby/setup-ruby CI action'ta 3.3 kullanılıyor)
#   - Bundler (`gem install bundler`)
#   - Git
#   - Apple Developer Program üyeliği ($99/yıl)
#   - App Store Connect Admin/Account Holder yetkisi

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

banner() {
  echo ""
  echo -e "${CYAN}================================================${NC}"
  echo -e "${CYAN}  ardiyesizgiris.com — iOS Code Signing Setup${NC}"
  echo -e "${CYAN}================================================${NC}"
  echo ""
}

step()  { echo -e "\n${GREEN}▶ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠  $*${NC}"; }
error() { echo -e "${RED}✘  $*${NC}"; exit 1; }

# ── Preflight ────────────────────────────────────────────────────────
banner

if [[ "$(uname)" != "Darwin" ]]; then
  error "Bu script sadece macOS'te çalışır. Apple kod imzalama için macOS zorunludur."
fi

command -v bundle >/dev/null 2>&1 || error "Bundler bulunamadı. Kurun: gem install bundler"
command -v git    >/dev/null 2>&1 || error "Git bulunamadı."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$(cd "$SCRIPT_DIR/../ios" && pwd)"

cd "$IOS_DIR"
step "Bağımlılıklar yükleniyor (bundle install)..."
bundle install --quiet

# ── Step 1: Apple Developer membership check ─────────────────────────
step "1/5 — Apple Developer Program üyeliği"

echo ""
echo "  iOS kod imzalama için Apple Developer Program üyeliği"
echo "  ($99 USD/yıl) zorunludur."
echo ""
echo "  Henüz üye değilseniz:"
echo "    https://developer.apple.com/programs/enroll/"
echo ""
read -r -p "  Apple Developer üyeliğiniz var mı? (y/n): " MEMBER

if [[ "$MEMBER" != "y" && "$MEMBER" != "Y" ]]; then
  error "Önce Apple Developer Program'a kaydolun, sonra bu scripti tekrar çalıştırın."
fi

# ── Step 2: App Store Connect API Key ────────────────────────────────
step "2/5 — App Store Connect API Key"

echo ""
echo "  App Store Connect → Entegrasyonlar → API Anahtarları:"
echo "    https://appstoreconnect.apple.com/access/integrations/api"
echo ""
echo "  'App Manager' yetkisiyle yeni bir API Key oluşturun."
echo "  .p8 dosyasını indirin (sadece bir kez gösterilir!)."
echo ""

read -r -p "  API Key ID (10 karakter, örn: AB1CD2EFGH): " ASC_KEY_ID
read -r -p "  Issuer ID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx): " ASC_ISSUER_ID
read -r -p "  .p8 dosyasının tam yolu (örn: ~/Downloads/AuthKey_${ASC_KEY_ID}.p8): " P8_PATH

if [[ ! -f "$P8_PATH" ]]; then
  # Also try standard location
  P8_PATH_EXPANDED="${HOME}/private_keys/AuthKey_${ASC_KEY_ID}.p8"
  if [[ -f "$P8_PATH_EXPANDED" ]]; then
    P8_PATH="$P8_PATH_EXPANDED"
  else
    error ".p8 dosyası bulunamadı: $P8_PATH"
  fi
fi

# Copy to standard location
mkdir -p ~/private_keys
cp "$P8_PATH" ~/private_keys/
echo -e "${GREEN}  ✓ .p8 dosyası ~/private_keys/ dizinine kopyalandı${NC}"

# ── Step 3: Create Match private git repo ────────────────────────────
step "3/5 — Fastlane Match Git Repo"

echo ""
echo "  Fastlane Match, sertifikaları şifreli bir git reposunda saklar."
echo "  GitHub'da PRIVATE bir repo oluşturun."
echo ""
echo "  Önerilen isim: ardiyesizgiris-ios-match"
echo ""

read -r -p "  Match repo HTTPS URL (örn: https://github.com/ozdem/ardiyesizgiris-ios-match.git): " MATCH_GIT_URL

if [[ -z "$MATCH_GIT_URL" ]]; then
  error "Match repo URL'si zorunludur."
fi

# Generate a strong random password for Match encryption
MATCH_PASSWORD=$(openssl rand -base64 32)
echo ""
echo -e "${YELLOW}  Match şifreleme parolası (kaydedin!):${NC}"
echo -e "  ${CYAN}${MATCH_PASSWORD}${NC}"
echo ""

# Test git access
step "  Git erişimi test ediliyor..."
if git ls-remote "$MATCH_GIT_URL" >/dev/null 2>&1; then
  echo -e "${GREEN}  ✓ Git erişimi başarılı${NC}"
else
  warn "Git reposuna erişilemedi. CI için HTTPS + Personal Access Token kullanın."
  warn "Örn: https://TOKEN@github.com/ozdem/ardiyesizgiris-ios-match.git"
fi

# ── Step 4: fastlane match init & generate ───────────────────────────
step "4/5 — Sertifika ve Provisioning Profile Üretimi"

echo ""
echo "  Fastlane Match, App Store dağıtım sertifikası ve provisioning"
echo "  profile oluşturacak. Bu işlem Apple Developer hesabınızı kullanır."
echo ""

# Set env vars for this run
export APPSTORE_CONNECT_KEY_ID="$ASC_KEY_ID"
export APPSTORE_CONNECT_ISSUER_ID="$ASC_ISSUER_ID"
export MATCH_PASSWORD="$MATCH_PASSWORD"
export MATCH_GIT_URL="$MATCH_GIT_URL"

echo "  Çalıştırılıyor: bundle exec fastlane match appstore"
echo "  Bu işlem birkaç dakika sürebilir..."
echo ""

bundle exec fastlane match appstore --verbose 2>&1 || {
  warn "match appstore başarısız oldu. Olası nedenler:"
  warn "  - Apple Developer hesabında geçerli bir provisioning profile yok"
  warn "  - App ID (com.ardiyesizgiris.web) App Store Connect'te kayıtlı değil"
  warn "  - API key yetkileri yetersiz (App Manager gerekli)"
  warn ""
  warn "App ID'yi manuel oluşturun: https://developer.apple.com/account/resources/identifiers"
  warn "Sonra bu scripti tekrar çalıştırın."
}

# ── Step 5: CI secrets summary ──────────────────────────────────────
step "5/5 — CI Secret'ları"

echo ""
echo "  Aşağıdaki secret'ları GitHub Actions'a ekleyin:"
echo "  Repo → Settings → Secrets and variables → Actions → New repository secret"
echo ""

ENCODED_KEY=$(openssl base64 -in ~/private_keys/AuthKey_${ASC_KEY_ID}.p8 | tr -d '\n')

cat << SUMMARY

  ┌─────────────────────────────────────────────────────────────────┐
  │                       CI SECRET'LARI                            │
  ├──────────────────────┬──────────────────────────────────────────┤
  │ Secret Adı           │ Değer                                    │
  ├──────────────────────┼──────────────────────────────────────────┤
  │ APPSTORE_CONNECT_KEY_ID    │ ${ASC_KEY_ID}                      │
  │ APPSTORE_CONNECT_ISSUER_ID │ ${ASC_ISSUER_ID}                   │
  │ APPSTORE_CONNECT_API_KEY   │ ${ENCODED_KEY}                     │
  │ MATCH_PASSWORD             │ ${MATCH_PASSWORD}                  │
  │ MATCH_GIT_URL              │ ${MATCH_GIT_URL}                   │
  └──────────────────────┴──────────────────────────────────────────┘

SUMMARY

echo ""
echo -e "${YELLOW}  ⚠ MATCH_PASSWORD'u güvenli bir yerde saklayın (1Password, vb.)${NC}"
echo -e "${YELLOW}  ⚠ .p8 dosyası TEK SEFER indirilir — kaybetmeyin!${NC}"
echo ""

# ── Final ──────────────────────────────────────────────────────────
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  iOS Code Signing kurulumu tamamlandı!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "  Sonraki adımlar:"
echo "  1. GitHub secret'larını yukarıdaki tabloya göre ayarlayın"
echo "  2. CI workflow'unu tetikleyin (push to main veya workflow_dispatch)"
echo "  3. TestFlight build'inin başarıyla yüklendiğini kontrol edin"
echo ""
