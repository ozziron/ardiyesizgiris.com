/**
 * Converts PWA SVG icons to PNG at specified sizes.
 * Run: node scripts/generate-pwa-pngs.mjs
 *
 * Input:  public/icons/*.svg (source: 512×512 design)
 * Output: public/icons/*.png at exact pixel dimensions
 */

import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const sharp = require("sharp")

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, "..", "public", "icons")

const targets = [
  // ── Standard app icons (PWA + web) ──────────────────────────
  { svg: "icon-512.svg", out: "icon-192.png", size: 192 },
  { svg: "icon-512.svg", out: "icon-512.png", size: 512 },
  { svg: "icon-512.svg", out: "icon-180.png", size: 180 },

  // Maskable icon (use maskable source with safe-zone already built in)
  { svg: "maskable-512.svg", out: "maskable-512.png", size: 512 },
  { svg: "maskable-512.svg", out: "maskable-192.png", size: 192 },

  // Apple touch icon
  { svg: "apple-touch-icon.svg", out: "apple-touch-icon.png", size: 180 },

  // ── App Store listing icon (Apple App Store + Google Play) ──
  { svg: "icon-1024.svg", out: "icon-1024.png", size: 1024 },

  // ── Android adaptive icon densities ─────────────────────────
  // Foreground — 108dp logical → scaled to density buckets
  { svg: "adaptive-icon-foreground.svg", out: "adaptive-foreground-mdpi.png", size: 108 },
  { svg: "adaptive-icon-foreground.svg", out: "adaptive-foreground-hdpi.png", size: 162 },
  { svg: "adaptive-icon-foreground.svg", out: "adaptive-foreground-xhdpi.png", size: 216 },
  { svg: "adaptive-icon-foreground.svg", out: "adaptive-foreground-xxhdpi.png", size: 324 },
  { svg: "adaptive-icon-foreground.svg", out: "adaptive-foreground-xxxhdpi.png", size: 432 },

  // Background — matching densities
  { svg: "adaptive-icon-background.svg", out: "adaptive-background-mdpi.png", size: 108 },
  { svg: "adaptive-icon-background.svg", out: "adaptive-background-hdpi.png", size: 162 },
  { svg: "adaptive-icon-background.svg", out: "adaptive-background-xhdpi.png", size: 216 },
  { svg: "adaptive-icon-background.svg", out: "adaptive-background-xxhdpi.png", size: 324 },
  { svg: "adaptive-icon-background.svg", out: "adaptive-background-xxxhdpi.png", size: 432 },

  // ── Android notification icon densities ─────────────────────
  { svg: "notification-icon.svg", out: "notification-mdpi.png", size: 24 },
  { svg: "notification-icon.svg", out: "notification-hdpi.png", size: 36 },
  { svg: "notification-icon.svg", out: "notification-xhdpi.png", size: 48 },
  { svg: "notification-icon.svg", out: "notification-xxhdpi.png", size: 72 },
  { svg: "notification-icon.svg", out: "notification-xxxhdpi.png", size: 96 },

  // ── Splash screen icon ──────────────────────────────────────
  { svg: "splash-icon.svg", out: "splash-icon.png", size: 512 },

  // ── iOS Splash Screens (device-specific) ────────────────────
  { svg: "splash-iphone-6-7.svg", out: "splash-iphone-6-7.png", size: null },
  { svg: "splash-iphone-6-5.svg", out: "splash-iphone-6-5.png", size: null },
  { svg: "splash-iphone-5-5.svg", out: "splash-iphone-5-5.png", size: null },
]

async function main() {
  for (const { svg, out, size } of targets) {
    const svgPath = join(iconsDir, svg)
    const outPath = join(iconsDir, out)

    const svgBuffer = readFileSync(svgPath)
    const pipeline = sharp(svgBuffer)

    if (size !== null && size !== undefined) {
      pipeline.resize(size, size)
    }
    // When size is null/undefined, sharp renders at the SVG's natural dimensions
    // (defined by width/height attributes on the root <svg> element)

    await pipeline.png({ compressionLevel: 6 }).toFile(outPath)

    const meta = await sharp(outPath).metadata()
    console.log(`✓ ${out} (${meta.width}×${meta.height})`)
  }

  console.log("\nDone — all PWA PNG icons generated.")
}

main().catch((err) => {
  console.error("PNG generation failed:", err)
  process.exit(1)
})
