import Link from "next/link"
import { Ship, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Ship className="h-8 w-8 text-emerald-600" />
              <span className="font-bold text-xl">Ardiyesiz Giriş</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli
              ardiyesiz gün hesaplama aracımızla operasyonlarınızı hızlandırın.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/hesaplama"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Ardiyesiz Giriş Hesaplama
                </Link>
              </li>
              <li>
                <Link
                  href="/#ozellikler"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Özellikler
                </Link>
              </li>
              <li>
                <Link
                  href="/#sss"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Sık Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Kaynaklar */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kaynaklar</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/giris"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link
                  href="/hesaplama"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Hesaplama Aracı
                </Link>
              </li>
              <li>
                <Link
                  href="/#sss"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Destek Merkezi
                </Link>
              </li>
              <li>
                <Link
                  href="/#cta"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  Demo Talep Et
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="font-semibold text-lg mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">+90 (212) 123 45 67</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-emerald-600 mr-2" />
                <a
                  href="mailto:info@ardiyesizgiris.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  info@ardiyesizgiris.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Ardiyesiz Giriş. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                href="/gizlilik-politikasi"
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 transition-colors"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/kullanim-kosullari"
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 transition-colors"
              >
                Kullanım Koşulları
              </Link>
              <Link
                href="/cerez-politikasi"
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-emerald-600 transition-colors"
              >
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
