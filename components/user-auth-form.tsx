"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface UserAuthFormProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export function UserAuthForm({ searchParams }: UserAuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setEmailNotVerified(false)
    setResendMessage(null)

    try {
      // NextAuth v5 (beta): with redirect:false the result object is
      // { error?: string, url?: string | null }. There is NO `ok` field —
      // the prior code that checked result?.ok always saw undefined and
      // silently fell through, redirecting bad credentials to /. The right
      // signal of failure is a non-empty `error` string.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // NextAuth v5 surfaces thrown errors from authorize() as
        // result.error === "CallbackRouteError" with the original message
        // accessible via result.code or embedded in the error string.
        // We check for our custom marker in the error string.
        if (
          result.error.includes("EMAIL_NOT_VERIFIED") ||
          result.code?.includes("EMAIL_NOT_VERIFIED")
        ) {
          setEmailNotVerified(true)
          setError("Lütfen önce email adresinizi onaylayın.")
        } else {
          setError("Geçersiz email veya şifre")
        }
        return
      }

      // Defence-in-depth: if neither error nor url came back, something
      // unexpected happened — surface it instead of silently navigating.
      if (!result || (result.error === undefined && !result.url)) {
        setError("Beklenmedik bir yanıt alındı. Lütfen tekrar deneyin.")
        return
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendVerification() {
    if (!email) {
      setResendMessage("Lütfen email adresinizi girin.")
      return
    }
    setResendLoading(true)
    setResendMessage(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setResendMessage(data.error || "Doğrulama emaili gönderilemedi.")
      } else {
        setResendMessage("Doğrulama emaili gönderildi. Lütfen email kutunuzu kontrol edin.")
      }
    } catch {
      setResendMessage("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {searchParams?.success && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <p className="text-sm text-green-700 dark:text-green-200">
              ✓ Kayıt başarılı! Doğrulama emailini kontrol edin, ardından giriş yapabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            {emailNotVerified && (
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-sm font-medium text-red-700 underline underline-offset-4 hover:text-red-800 dark:text-red-300 disabled:opacity-50"
                >
                  {resendLoading ? "Gönderiliyor..." : "Doğrulama emailini tekrar gönder"}
                </button>
                {resendMessage && (
                  <p className="text-sm text-red-600 dark:text-red-300">{resendMessage}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="ornek@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          placeholder="••••••••"
          type="password"
          autoCapitalize="none"
          autoComplete="current-password"
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button disabled={isLoading} className="w-full">
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  )
}
