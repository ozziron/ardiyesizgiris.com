"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!result?.ok) {
        setError("Geçersiz email veya şifre")
        return
      }

      // Her zaman anasayfaya yönlendir
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {searchParams?.success && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <p className="text-sm text-green-700 dark:text-green-200">✓ Kayıt başarılı! Şimdi giriş yapabilirsiniz.</p>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
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
