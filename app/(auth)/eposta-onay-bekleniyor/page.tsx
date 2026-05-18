"use client"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, Mail, RefreshCw } from "lucide-react"

function EmailPendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleResend() {
    if (!email) return
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Doğrulama emaili gönderilemedi." })
      } else {
        setMessage({ type: "success", text: "Doğrulama emaili tekrar gönderildi. Lütfen email kutunuzu kontrol edin." })
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 px-4 py-12">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
          <Mail className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Email Adresinizi Onaylayın</h1>
        <p className="text-sm text-muted-foreground">
          Hesabınızı aktif etmek için email adresinizi doğrulamanız gerekiyor.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            <strong className="text-foreground">{email || "Email adresinize"}</strong> bir doğrulama
            linki gönderdik. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
          </p>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
              Link 24 saat geçerlidir. Süresi dolmadan onaylamayı unutmayın.
            </p>
          </div>

          {message && (
            <div
              className={`rounded-md border p-3 ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              }`}
            >
              <p
                className={`text-sm text-center ${
                  message.type === "success"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Gönderiliyor..." : "Doğrulama Emailini Tekrar Gönder"}
            </Button>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Zaten onayladınız mı?{" "}
        <Link href="/giris" className="underline underline-offset-4 hover:text-primary">
          Giriş Yapın
        </Link>
      </p>
    </div>
  )
}

export default function EmailPendingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-2 p-4 border-b">
        <Ship className="h-5 w-5 text-emerald-600" />
        <span className="font-medium text-sm">Ardiyesiz Giriş</span>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Yükleniyor...</div>}>
          <EmailPendingContent />
        </Suspense>
      </main>
    </div>
  )
}
