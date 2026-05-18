"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Menu, Calculator, Sun, Moon, LogOut, User, LayoutDashboard, Settings, History, ChevronDown } from "lucide-react"
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
      <div className="container mx-auto px-4 grid grid-cols-3 items-center">
        {/* Left: Navigation Dropdown */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Menu className="h-4 w-4" />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/">Ana Sayfa</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hesaplama">Hesaplama</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/takip">Takip</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Brand */}
        <div className="flex justify-center">
          <Wordmark />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-3">
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

      </div>
    </header>
  )
}
