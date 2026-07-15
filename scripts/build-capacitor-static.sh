#!/usr/bin/env bash
#
# build-capacitor-static.sh
#
# Produces a static HTML/JS/CSS bundle at out/ suitable for Capacitor's
# webDir.  Next.js 15 App Router does not support 'generateStaticParams' in
# route.ts files under 'output: export', so this script temporarily hides the
# API route handlers, runs the static build, then restores them.
#
# Usage:
#   bash scripts/build-capacitor-static.sh
#
# Prerequisites:
#   - NEXT_PUBLIC_API_BASE_URL must be set (e.g. https://www.ardiyesizgiris.com)
#     so the Capacitor webview knows where the live API lives.
#   - prisma generate must have already run (or be enabled in the build).
#
# Caveats:
#   - The static bundle has no server-side rendering.  Authentication relies
#     on client-side session tokens and calls to the live Vercel API.
#   - This script rewrites next.config.mjs temporarily; it restores the
#     original on exit (even on failure).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP="$ROOT/scripts/.next.config.mjs.bak-$$"

# ── fail-safe: restore next.config.mjs on exit ──────────────────────────
restore_config() {
  if [ -f "$BACKUP" ]; then
    echo "[capacitor-static] Restoring next.config.mjs …"
    mv "$BACKUP" "$ROOT/next.config.mjs"
  fi
}
trap restore_config EXIT

# ── 1. Patch next.config.mjs → output: "export" ────────────────────────
echo "[capacitor-static] Patching next.config.mjs → output: 'export' …"
cp "$ROOT/next.config.mjs" "$BACKUP"

sed -i 's|}/**@type|  output: "export",\n}/** @type|' "$ROOT/next.config.mjs" 2>/dev/null || true

# If the simple sed didn't work, use a node one-liner
if ! grep -q 'output:.*"export"' "$ROOT/next.config.mjs"; then
  node -e "
    const fs = require('fs');
    const c = fs.readFileSync('$ROOT/next.config.mjs', 'utf8');
    const patched = c.replace(
      /(const nextConfig = \\{)/,
      '\$1\n  output: \"export\",'
    );
    fs.writeFileSync('$ROOT/next.config.mjs', patched);
  "
fi

# ── 2. Add force-static to all API route handlers ──────────────────────
echo "[capacitor-static] Adding force-static + generateStaticParams to API routes …"
for f in $(find "$ROOT/app/api" -name "route.ts" -type f 2>/dev/null); do
  # Skip if already patched
  grep -q "BUILD-CAPACITOR-STATIC" "$f" 2>/dev/null && continue

  # Insert after the last import block
  node -e "
    const fs = require('fs');
    let c = fs.readFileSync('$f', 'utf8');
    const marker = '// BUILD-CAPACITOR-STATIC: force-static + generateStaticParams (auto-generated)';
    const hasDynamicSegment = '$f'.includes('[');
    let patch = marker + '\nexport const dynamic = \"force-static\";\n';
    if (hasDynamicSegment) {
      patch += 'export async function generateStaticParams() { return []; }\nexport const dynamicParams = false;\n';
    }
    // Insert after last import line (ends with ; or } from import block)
    const lines = c.split('\n');
    let lastImport = 0;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l.startsWith('import ') || l.startsWith('} from') || l === '}') lastImport = i;
    }
    lines.splice(lastImport + 1, 0, '', patch);
    fs.writeFileSync('$f', lines.join('\n'));
  "
done

# ── 3. Patch well-known routes ─────────────────────────────────────────
for f in "$ROOT/app/.well-known/apple-app-site-association/route.ts" \
         "$ROOT/app/.well-known/assetlinks.json/route.ts"; do
  grep -q "BUILD-CAPACITOR-STATIC" "$f" 2>/dev/null && continue
  node -e "
    const fs = require('fs');
    let c = fs.readFileSync('$f', 'utf8');
    c = '// BUILD-CAPACITOR-STATIC\nexport const dynamic = \"force-static\";\n' + c;
    fs.writeFileSync('$f', c);
  "
done

# ── 4. Build the static export ─────────────────────────────────────────
echo "[capacitor-static] Building static export …"
cd "$ROOT"
NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-https://www.ardiyesizgiris.com}" \
  npx next build

# ── 5. Clean up build-time patches from the API route files ────────────
echo "[capacitor-static] Cleaning up build-time patches …"
for f in $(find "$ROOT/app/api" "$ROOT/app/.well-known" -name "route.ts" -type f 2>/dev/null); do
  grep -q "BUILD-CAPACITOR-STATIC" "$f" 2>/dev/null || continue
  node -e "
    const fs = require('fs');
    let c = fs.readFileSync('$f', 'utf8');
    // Remove the marker line and everything between it and the first non-patch code
    c = c.replace(/\/\/ BUILD-CAPACITOR-STATIC[^\n]*\n(?:export[^\n]*\n)*\n?/g, '');
    // Remove leading blank line if present
    c = c.replace(/^\n+/, '');
    fs.writeFileSync('$f', c);
  "
done

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✓ Capacitor static bundle ready at out/                   ║"
echo "║                                                            ║"
echo "║  Next steps:                                               ║"
echo "║    npx cap sync          → sync web assets to native proj  ║"
echo "║    npx cap open android  → open Android Studio             ║"
echo "║    npx cap open ios      → open Xcode                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
