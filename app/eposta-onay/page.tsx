import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Ship, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Email Onayı | Ardiyesiz Giriş",
}

type Status = "success" | "expired" | "invalid"

interface StatusConfig {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  actionHref: string
  cardClass: string
}

function getStatusConfig(status: Status): StatusConfig {
  switch (status) {
    case "success":
      return {
        icon: <CheckCircle2 className="h-12 w-12 text-emerald-600" />,
        title: "Email Onaylandı!",
        description: "Email adresiniz başarıyla doğrulandı. Artık hesabınıza giriş yapabilirsiniz.",
        actionLabel: "Giriş Yap",
        actionHref: "/giris",
        cardClass: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
      }
    case "expired":
      return {
        icon: <Clock className="h-12 w-12 text-amber-600" />,
        title: "Bağlantının Süresi Doldu",
        description:
          "Doğrulama bağlantısının süresi dolmuş. Yeni bir doğrulama emaili almak için aşağıya tıklayın.",
        actionLabel: "Yeni Doğrulama Emaili Al",
        actionHref: "/eposta-onay-bekleniyor",
        cardClass: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
      }
    default:
      return {
        icon: <XCircle className="h-12 w-12 text-red-600" />,
        title: "Geçersiz Bağlantı",
        description:
          "Bu doğrulama bağlantısı geçersiz veya daha önce kullanılmış. Yeni bir link talep edebilirsiniz.",
        actionLabel: "Tekrar Dene",
        actionHref: "/eposta-onay-bekleniyor",
        cardClass: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
      }
  }
}

async function VerificationResult({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const statusParam = params.status
  const status: Status =
    statusParam === "success" || statusParam === "expired" ? statusParam : "invalid"
  const config = getStatusConfig(status)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 px-4 py-12">
      <div className="flex flex-col items-center space-y-3 text-center">
        {config.icon}
        <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{config.description}</p>
      </div>

      <Card className={config.cardClass}>
        <CardContent className="p-6 flex flex-col items-center space-y-4">
          <Button asChild className="w-full">
            <Link href={config.actionHref}>{config.actionLabel}</Link>
          </Button>
          {status !== "success" && (
            <Link
              href="/giris"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
            >
              Giriş sayfasına dön
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function EmailVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-2 p-4 border-b">
        <Ship className="h-5 w-5 text-emerald-600" />
        <span className="font-medium text-sm">Ardiyesiz Giriş</span>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Yükleniyor...</div>}>
          <VerificationResult searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}
