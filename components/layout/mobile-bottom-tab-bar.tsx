"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, FileText, Home, BookOpen } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

const TABS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/hesaplama", label: "Hesaplama", icon: Calculator },
  { href: "/fiyatlandirma", label: "Fiyatlar", icon: FileText },
  { href: "/sozluk", label: "Sözlük", icon: BookOpen },
] as const

export function MobileBottomTabBar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Hide on admin routes and on desktop
  if (pathname.startsWith("/admin") || !isMobile) return null

  // Hide on auth pages
  if (pathname.startsWith("/giris") || pathname.startsWith("/kayit")) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95 md:hidden"
      role="navigation"
      aria-label="Mobil gezinme"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
