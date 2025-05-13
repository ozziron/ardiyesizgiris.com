"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Ship, Calculator, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Ship className="h-8 w-8 text-emerald-600" />
          <span className="font-bold text-xl">Ardiyesiz Giriş</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="font-medium hover:text-emerald-600 transition-colors">
            Ana Sayfa
          </Link>
          <Link href="/hesaplama" className="font-medium hover:text-emerald-600 transition-colors">
            Ardiyesiz Giriş Hesaplama
          </Link>
          <Link href="/limanlar" className="font-medium hover:text-emerald-600 transition-colors">
            Limanlar
          </Link>
          <Link href="/iletisim" className="font-medium hover:text-emerald-600 transition-colors">
            İletişim
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Tema değiştir"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button asChild>
            <Link href="/hesaplama">
              <Calculator className="mr-2 h-4 w-4" />
              Hesapla
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menü">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="font-medium hover:text-emerald-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/hesaplama"
              className="font-medium hover:text-emerald-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Ardiyesiz Giriş Hesaplama
            </Link>
            <Link
              href="/limanlar"
              className="font-medium hover:text-emerald-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Limanlar
            </Link>
            <Link
              href="/iletisim"
              className="font-medium hover:text-emerald-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              İletişim
            </Link>
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Tema değiştir"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button asChild size="sm">
                <Link href="/hesaplama" onClick={() => setIsMenuOpen(false)}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Hesapla
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
