"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield, Calendar, Calculator, Settings } from "lucide-react"
import Link from "next/link"

export default function ProfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris?callbackUrl=/profil")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!session) return null

  const isAdmin = session.user?.role === "ADMIN"
  const createdAt = session.user?.createdAt

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profilim</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Hesap bilgilerinizi görüntüleyin</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-semibold">{session.user?.name || "İsim belirtilmemiş"}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isAdmin ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0">
                      <Shield className="mr-1 h-3 w-3" />
                      Yönetici
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <User className="mr-1 h-3 w-3" />
                      Kullanıcı
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">E-posta Adresi</p>
                  <p className="text-sm font-medium">{session.user?.email}</p>
                </div>
              </div>

              {createdAt && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Üyelik Tarihi</p>
                    <p className="text-sm font-medium">
                      {new Date(createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Shield className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Hesap Türü</p>
                  <p className="text-sm font-medium">{isAdmin ? "Yönetici Hesabı" : "Standart Hesap"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hızlı Erişim</CardTitle>
            <CardDescription>Sık kullandığınız sayfalara hızla ulaşın</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link href="/hesaplama">
                <Calculator className="mr-3 h-5 w-5 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium">Yeni Hesaplama</p>
                  <p className="text-xs text-muted-foreground">Ardiyesiz giriş tarihi hesapla</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link href="/hesaplamalarim">
                <Calculator className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Hesaplamalarım</p>
                  <p className="text-xs text-muted-foreground">Geçmiş hesaplamalarım</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link href="/ayarlar">
                <Settings className="mr-3 h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium">Ayarlar</p>
                  <p className="text-xs text-muted-foreground">Şifre ve hesap ayarları</p>
                </div>
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="outline" className="justify-start h-auto py-3 border-emerald-200 hover:border-emerald-400">
                <Link href="/admin">
                  <Shield className="mr-3 h-5 w-5 text-emerald-600" />
                  <div className="text-left">
                    <p className="font-medium text-emerald-600">Yönetici Paneli</p>
                    <p className="text-xs text-muted-foreground">Sistem yönetimi</p>
                  </div>
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
