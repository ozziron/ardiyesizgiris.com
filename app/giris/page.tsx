import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { UserAuthForm } from "@/components/user-auth-form"
import { Ship } from "lucide-react"

export const metadata: Metadata = {
  title: "Giriş Yap | Ardiyesiz Giriş",
  description: "Hesabınıza giriş yapın ve ardiyesiz giriş hesaplamalarınızı yönetin.",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-[80vh]">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-emerald-600" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Ship className="mr-2 h-6 w-6" />
          Ardiyesiz Giriş
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Ardiyesiz Giriş hesaplama aracı sayesinde lojistik süreçlerimizi çok daha verimli yönetiyoruz. Zaman ve
              maliyet tasarrufu sağlıyoruz."
            </p>
            <footer className="text-sm">Ahmet Yılmaz - Lojistik Müdürü</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Hesabınıza Giriş Yapın</h1>
            <p className="text-sm text-muted-foreground">E-posta adresinizi ve şifrenizi girerek hesabınıza erişin</p>
          </div>
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <UserAuthForm searchParams={searchParams} />
          </Suspense>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="underline underline-offset-4 hover:text-primary">
              Hemen Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
