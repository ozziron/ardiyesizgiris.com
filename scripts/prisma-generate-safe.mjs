/**
 * Windows-safe Prisma generate wrapper.
 *
 * On Windows, if any Node process has loaded @prisma/client, the query engine
 * DLL (query_engine-windows.dll.node) is locked and cannot be renamed. This
 * wrapper catches EPERM and prints a recovery guide instead of failing the
 * entire `npm install`.
 *
 * On non-Windows platforms it delegates straight to `prisma generate`.
 */

import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const IS_WINDOWS = platform() === 'win32';

try {
  // Pass stdin/stdout to terminal, capture stderr for EPERM detection
  execSync('npx prisma generate', { stdio: ['inherit', 'inherit', 'pipe'] });
} catch (err) {
  // When stderr is piped, the EPERM text lives on err.stderr.
  // When stdio:'inherit', it went straight to the terminal and we check .message.
  const stderr = (err.stderr || '').toString();
  const message = (err.message || '').toString();
  const isEperm = stderr.includes('EPERM') || message.includes('EPERM');

  if (IS_WINDOWS && isEperm) {
    console.warn('');
    console.warn('╔══════════════════════════════════════════════════════════════╗');
    console.warn('║  ⚠ WINDOWS DLL LOCK DETECTED                               ║');
    console.warn('║  Prisma query engine DLL is locked by a running process.   ║');
    console.warn('║  Recovery (PowerShell as Administrator not required):       ║');
    console.warn('║                                                            ║');
    console.warn('║  1. Close ALL terminals / editors in this repo             ║');
    console.warn('║  2. Run: ./scripts/fix-prisma-lock.ps1                     ║');
    console.warn('║  3. Then: npx prisma generate                              ║');
    console.warn('║                                                            ║');
    console.warn('║  npm install completed; Prisma client was NOT regenerated.  ║');
    console.warn("║  If package.json / schema.prisma haven't changed, the      ║");
    console.warn('║  existing Prisma client is still valid — no action needed.  ║');
    console.warn('╚══════════════════════════════════════════════════════════════╝');
    console.warn('');
    // Exit 0 so npm install doesn't fail
    process.exit(0);
  }
  // On non-Windows or non-EPERM errors, fail normally
  if (stderr) console.error(stderr);
  else console.error(message);
  process.exit(err.status || 1);
}
