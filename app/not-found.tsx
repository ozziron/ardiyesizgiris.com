import Link from "next/link"
import { Ship } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 ring-1 ring-emerald-200/50 dark:bg-emerald-950/30 dark:ring-emerald-800/30">
          <Ship className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="font-display text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          404
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Bu sayfaya varış bulunamadı. Liman kodu yanlış olabilir veya sayfa taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition-all hover:bg-emerald-700 dark:shadow-emerald-900/30"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
