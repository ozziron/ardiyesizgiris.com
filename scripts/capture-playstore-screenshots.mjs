/**
 * Google Play Store ekran görüntüsü yakalama — sıfır bağımlılık (Node.js built-ins + Chrome CDP).
 *
 * Kullanım: node scripts/capture-playstore-screenshots.mjs
 * Ön koşul: dev server (localhost:3000) çalışıyor olmalı
 *
 * Çıktı: android/fastlane/metadata/android/images/phoneScreenshots/
 */

import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, existsSync, rmdirSync, statSync as fsStatSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'android', 'fastlane', 'metadata', 'android', 'images', 'phoneScreenshots');

const CHROME = 'C:\\Users\\ozdem\\.cache\\puppeteer\\chrome\\win64-150.0.7871.24\\chrome-win64\\chrome.exe';
const BASE_URL = 'http://localhost:3003';
const VW = 360;
const VH = 640;
const DPR = 3;

const SCREENS = [
  { name: '1_main', path: '/', desc: 'Ana sayfa' },
  { name: '2_calculation', path: '/hesaplama', desc: 'Hesaplama formu' },
  { name: '3_results', path: '/hesaplama/sonuc?freeUntil=2026-08-15&freeDays=7', desc: 'Hesap sonucu' },
  { name: '4_pricing', path: '/fiyatlandirma', desc: 'Fiyatlandirma' },
];

async function cdpSend(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1e9);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 30000);
    function onMsg(event) {
      try {
        const msg = JSON.parse(event.data.toString());
        if (msg.id === id) {
          ws.removeEventListener('message', onMsg);
          clearTimeout(t);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch { /* ignore */ }
    }
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  if (!existsSync(CHROME)) {
    console.error('Chrome bulunamadi:', CHROME);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const PORT = 9400 + Math.floor(Math.random() * 400);
  const profDir = resolve(tmpdir(), 'cdp-profile-' + randomBytes(4).toString('hex'));

  console.log(`Port: ${PORT}, Profile: ${profDir}`);

  const proc = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:3003',  // start on homepage
  ], {
    stdio: 'ignore',
    env: { ...process.env, HTTP_PROXY: '', HTTPS_PROXY: '', NO_PROXY: '*' },
  });

  // Wait for Chrome CDP
  let pageWsUrl = null;
  for (let i = 0; i < 60; i++) {
    try {
      // Get the first page target (not the browser itself)
      const resp = await fetch(`http://localhost:${PORT}/json`);
      if (resp.ok) {
        const targets = await resp.json();
        // Find the page target (type: 'page')
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          pageWsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch { /* not ready */ }
    await new Promise(r => setTimeout(r, 500));
  }

  if (!pageWsUrl) {
    proc.kill();
    console.error('Chrome page target bulunamadi');
    process.exit(1);
  }

  console.log('Chrome ready, capturing screenshots...\n');

  // Single WebSocket connection for all captures
  const ws = new WebSocket(pageWsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error('WS connect error'));
    setTimeout(() => reject(new Error('WS connect timeout')), 10000);
  });

  try {
    // Enable required domains
    await cdpSend(ws, 'Page.enable');
    await cdpSend(ws, 'Network.enable');

    // Set mobile viewport once
    await cdpSend(ws, 'Emulation.setDeviceMetricsOverride', {
      width: VW, height: VH, deviceScaleFactor: DPR,
      mobile: true, screenWidth: 1080, screenHeight: 1920,
    });
    await cdpSend(ws, 'Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
    });

    for (const screen of SCREENS) {
      const url = `${BASE_URL}${screen.path}`;
      console.log(`[${screen.name}] ${url}`);

      // Navigate
      await cdpSend(ws, 'Page.navigate', { url });

      // Wait for page load
      await new Promise(r => setTimeout(r, 2000));
      for (let i = 0; i < 15; i++) {
        try {
          const r = await cdpSend(ws, 'Runtime.evaluate', {
            expression: 'document.readyState', returnByValue: true,
          });
          if (r.result?.value === 'complete') break;
        } catch { /* retry */ }
        await new Promise(r => setTimeout(r, 500));
      }

      // Extra wait for rendering
      await new Promise(r => setTimeout(r, 1500));

      // Scroll to top
      try {
        await cdpSend(ws, 'Runtime.evaluate', { expression: 'window.scrollTo(0,0)' });
      } catch { /* ignore */ }

      // Capture
      const result = await cdpSend(ws, 'Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: VW, height: VH, scale: 1 },
        captureBeyondViewport: false,
      });

      const buf = Buffer.from(result.data, 'base64');
      const outPath = resolve(OUT_DIR, `${screen.name}.png`);
      writeFileSync(outPath, buf);
      console.log(`       -> ${screen.name}.png ${(buf.length / 1024).toFixed(0)} KB`);
    }
  } finally {
    ws.close();
    proc.kill();
    try { rmdirSync(profDir, { recursive: true }); } catch { /* ok */ }
  }

  // Final check
  console.log('\n--- Sonuc ---');
  let allOk = true;
  for (const s of SCREENS) {
    const p = resolve(OUT_DIR, `${s.name}.png`);
    if (existsSync(p)) {
      const st = fsStatSync(p);
      console.log(`  ${s.name}.png: ${(st.size / 1024).toFixed(0)} KB`);
      if (st.size < 5000) allOk = false;
    } else {
      console.log(`  ${s.name}.png: BULUNAMADI`);
      allOk = false;
    }
  }
  if (allOk) console.log('\nTum ekran goruntuleri basariyla alindi!');
  else console.log('\nBazi ekran goruntuleri sorunlu olabilir.');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
