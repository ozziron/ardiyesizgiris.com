"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { ArrowUpRight, LogOut, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/admin": "Yonetici Paneli",
  "/admin/limanlar": "Liman Yonetimi",
  "/admin/gemiler": "Hat Yonetimi",
  "/admin/ucret-tarifeleri": "Ucret Tarifeleri",
}

export function AdminHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const pageTitle =
    Object.entries(pageTitles).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] ??
    "Yonetici Paneli"

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
            Admin Workspace
          </p>
          <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-emerald-900 dark:hover:text-emerald-300 md:flex"
          >
            Siteye Don
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right dark:border-slate-800 dark:bg-slate-900 sm:block">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {session?.user?.name || session?.user?.email || "Admin"}
            </p>
            <p className="flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Yetkili oturum
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cikis
          </Button>
        </div>
      </div>
    </header>
  )
}
