"use client"

import { useEffect } from "react"
import { Ship } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 ring-1 ring-red-200/50 dark:bg-red-950/30 dark:ring-red-800/30">
          <Ship className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bir hata oluştu
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition-all hover:bg-emerald-700 dark:shadow-emerald-900/30"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}
