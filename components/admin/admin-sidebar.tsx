"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Anchor, BarChart3, Box, FileBarChart, Ship, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Limanlar", href: "/admin/limanlar", icon: Anchor },
  { label: "Hatlar", href: "/admin/gemiler", icon: Ship },
  { label: "Ekipman Tipleri", href: "/admin/ekipman-tipleri", icon: Box },
  { label: "Tarifeler", href: "/admin/ucret-tarifeleri", icon: TrendingUp },
  { label: "Raporlar", href: "/admin/raporlar", icon: FileBarChart },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-slate-100 lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
            <Ship className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ardiyesiz Giriş</p>
            <p className="text-xs text-slate-400">Yönetim paneli</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-500 text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.28)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs leading-5 text-slate-400">
          Hat, liman ve ekipman bazlı kuralları buradan yönetebilirsiniz.
        </p>
      </div>
    </aside>
  )
}
