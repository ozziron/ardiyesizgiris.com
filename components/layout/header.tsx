"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Calculator, Sun, Moon, LogOut, User, LayoutDashboard, Settings, History, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/brand/wordmark"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <header
      // Static appearance — no scroll reaction. Earlier design went
      // transparent at the top and only opaque after scroll, which made
      // the first viewport look like "no header is present" and produced
      // a visible visual jump when clicking in-page anchors (e.g. #sss).
      // Keeping one consistent style removes that surprise. Backdrop blur
      // lets the emerald hero gradient tint through softly without losing
      // readability.
      className={cn(
        "fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-3",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Wordmark />


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="font-medium hover:text-emerald-600 transition-colors">
            Ana Sayfa
          </Link>
          <Link href="/hesaplama" className="font-medium hover:text-emerald-600 transition-colors">
            Hesaplama
          </Link>
          <Link href="/hakkimizda" className="font-medium hover:text-emerald-600 transition-colors">
            Hakkımızda
          </Link>
          <Link href="/#sss" className="font-medium hover:text-emerald-600 transition-colors">
            SSS
          </Link>
          <Link href="/iletisim" className="font-medium hover:text-emerald-600 transition-colors">
            İletişim
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Tema değiştir"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {status === "loading" ? (
            <div className="h-9 w-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
          ) : session ? (
            /* Logged in user menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="truncate">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">
                      {session.user?.name || "Kullanıcı"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide w-fit mt-1">
                        Yönetici
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profilim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hesaplamalarim" className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    Hesaplamalarım
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hesaplama" className="cursor-pointer">
                    <Calculator className="mr-2 h-4 w-4" />
                    Yeni Hesaplama
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ayarlar" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-emerald-600 focus:text-emerald-600">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Yönetici Paneli
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Not logged in */
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/giris">Giriş Yap</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/kayit">Kayıt Ol</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Tema değiştir"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menü">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg py-4 px-4 z-50">
          <nav className="flex flex-col space-y-1">
            <Link href="/" className="font-medium hover:text-emerald-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Ana Sayfa
            </Link>
            <Link href="/hesaplama" className="font-medium hover:text-emerald-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Hesaplama
            </Link>
            <Link href="/hakkimizda" className="font-medium hover:text-emerald-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Hakkımızda
            </Link>
            <Link href="/#sss" className="font-medium hover:text-emerald-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              SSS
            </Link>
            <Link href="/iletisim" className="font-medium hover:text-emerald-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              İletişim
            </Link>

            <div className="pt-3 mt-2 border-t flex flex-col gap-2">
              {session ? (
                <>
                  <div className="px-2 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{session.user?.name || "Kullanıcı"}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link href="/profil" className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                    <User className="h-4 w-4" /> Profilim
                  </Link>
                  <Link href="/hesaplamalarim" className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                    <History className="h-4 w-4" /> Hesaplamalarım
                  </Link>
                  <Link href="/ayarlar" className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                    <Settings className="h-4 w-4" /> Ayarlar
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-sm font-medium text-emerald-600" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Yönetici Paneli
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 mt-1"
                    onClick={() => { signOut({ callbackUrl: "/" }); setIsMenuOpen(false) }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/giris">Giriş Yap</Link>
                  </Button>
                  <Button asChild size="sm" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/kayit">Kayıt Ol</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
