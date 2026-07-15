import { PrismaClient } from "@prisma/client"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

// ---------------------------------------------------------------------------
// import-tariffs.ts / export-tariffs.ts ortak yardımcıları.
//
// DB hedefi:
//   dev  (varsayılan) -> main/.env içindeki DATABASE_URL (Prisma default)
//   prod              -> main/.env.production-db içindeki DATABASE_URL
//                        (vercel env pull ile üretilir; gitignore kapsamında)
// ---------------------------------------------------------------------------

export type DbTarget = "dev" | "prod"

export const PROD_ENV_FILE = ".env.production-db"

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let value = m[2]!
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[m[1]!] = value
  }
  return out
}

export function makeClient(target: DbTarget): PrismaClient {
  if (target === "dev") {
    return new PrismaClient()
  }
  const envPath = resolve(process.cwd(), PROD_ENV_FILE)
  if (!existsSync(envPath)) {
    throw new Error(
      `${PROD_ENV_FILE} bulunamadı. Üretmek için: vercel env pull ${PROD_ENV_FILE} --environment=production`,
    )
  }
  const env = parseEnvFile(envPath)
  const url = env.DATABASE_URL
  if (!url) {
    throw new Error(`${PROD_ENV_FILE} içinde DATABASE_URL yok`)
  }
  return new PrismaClient({ datasourceUrl: url })
}

/** Basit CLI arg ayrıştırıcı: pozisyonel + --flag ve --key value */
export function parseArgs(argv: string[]): {
  positional: string[]
  flags: Set<string>
  options: Record<string, string>
} {
  const positional: string[] = []
  const flags = new Set<string>()
  const options: Record<string, string> = {}
  const valueOptions = new Set(["--db", "--carrier", "--out"])
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a.startsWith("--")) {
      if (valueOptions.has(a) && i + 1 < argv.length && !argv[i + 1]!.startsWith("--")) {
        options[a] = argv[++i]!
      } else {
        flags.add(a)
      }
    } else {
      positional.push(a)
    }
  }
  return { positional, flags, options }
}

export function resolveDbTarget(options: Record<string, string>): DbTarget {
  const db = options["--db"] ?? "dev"
  if (db !== "dev" && db !== "prod") {
    throw new Error(`--db yalnızca 'dev' veya 'prod' olabilir, '${db}' verildi`)
  }
  return db
}

export function toDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`)
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
