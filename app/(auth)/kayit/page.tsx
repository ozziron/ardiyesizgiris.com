"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Ship } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!termsAccepted) {
      setError("Devam etmek için Hizmet Sözleşmesi ve KVKK Aydınlatma Metni'ni kabul etmeniz gerekir.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, companyName, termsAccepted }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Kayıt başarısız")
      }

      // Redirect to "email pending" page — pass email as query param
      router.push(`/eposta-onay-bekleniyor?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

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
              "Ardiyesiz Giriş ile hesaplama yapmak çok kolay. Hızlı, güvenli ve güvenilir."
            </p>
            <footer className="text-sm">Kullanıcı Görüşü</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Hesap Oluştur</h1>
            <p className="text-sm text-muted-foreground">Aşağıdaki bilgileri girerek hesap oluşturun</p>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyadı</Label>
              <Input
                id="name"
                placeholder="Ahmet Yılmaz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="ornek@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Şirket Adı (Opsiyonel)</Label>
              <Input
                id="company"
                placeholder="Şirket A.Ş."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre (En az 8 karakter)</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                disabled={isLoading}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                <Link
                  href="/sozlesme"
                  target="_blank"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Hizmet Sözleşmesi
                </Link>
                {" "}ve{" "}
                <Link
                  href="/kvkk"
                  target="_blank"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni okudum ve kabul ediyorum.
              </Label>
            </div>

            <Button disabled={isLoading || !termsAccepted} className="w-full">
              {isLoading ? "Oluşturuluyor..." : "Hesap Oluştur"}
            </Button>
          </form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="underline underline-offset-4 hover:text-primary">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
