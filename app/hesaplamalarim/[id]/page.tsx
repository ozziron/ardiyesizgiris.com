"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Ship, Calendar, Clock, Wallet, FileDown, Mail, CheckCircle2, AlertCircle, TestTube2, Download, Container } from "lucide-react"
import Link from "next/link"

interface ExportRecord {
  id: string
  type: "PDF" | "EMAIL"
  recipient: string | null
  status: "success" | "failed" | "dry_run" | "not_configured"
  createdAt: string
}

interface CalculationDetail {
  id: string
  portName: string
  portCode: string
  carrierName: string
  carrierCode: string
  containerId: string
  containerType: string
  departureDate: string
  gateInDate: string | null
  freeDays: number
  freeUntilDate: string
  chargeableDays: number
  totalCharge: string
  createdAt: string
  exports: ExportRecord[]
}

const formatDate = (iso: string | Date) => new Date(iso).toLocaleDateString("tr-TR")
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })
const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(value))

const statusVisuals: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  success: { label: "Başarılı", className: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  dry_run: { label: "Test modu", className: "text-blue-600 dark:text-blue-400", icon: TestTube2 },
  not_configured: { label: "Servis aktif değil", className: "text-amber-700 dark:text-amber-400", icon: AlertCircle },
  failed: { label: "Başarısız", className: "text-red-600 dark:text-red-400", icon: AlertCircle },
}

export default function HesaplamaDetayPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [calculation, setCalculation] = useState<CalculationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris?callbackUrl=/hesaplamalarim")
    }
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchCalculation()
    }
  }, [session, params.id])

  async function fetchCalculation() {
    try {
      const res = await fetch(`/api/users/calculations/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setCalculation(data.data)
      } else {
        const data = await res.json()
        setError(data.error || "Hesaplama bulunamadı")
      }
    } catch {
      setError("Hesaplama yüklenemedi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!calculation) return

    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculationType: "cost",
          calculationId: calculation.id,
          portalName: calculation.portName,
          carrierName: calculation.carrierName,
          containerId: calculation.containerId,
          containerType: calculation.containerType,
          departureDate: calculation.departureDate,
          gateInDate: calculation.gateInDate,
          freeDays: calculation.freeDays,
          freeUntilDate: calculation.freeUntilDate,
          totalCharge: calculation.totalCharge,
          chargeableDays: calculation.chargeableDays,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.error || "PDF oluşturulamadı")

      const link = document.createElement("a")
      link.href = data.pdfDataUri
      link.download = `ardiyesiz-masraf-${calculation.containerId}-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("PDF download error:", err)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!session) return null

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Hata</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/hesaplamalarim">Geri Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!calculation) return null

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/hesaplamalarim">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Hesaplamalarıma Dön
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Hesaplama Detayı</h1>
            <Badge variant="secondary">{calculation.containerType}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {calculation.portName} &middot; {calculation.carrierName}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Genel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liman</span>
                <span className="font-medium">{calculation.portName} ({calculation.portCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hat</span>
                <span className="font-medium">{calculation.carrierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Konteyner Tipi</span>
                <span className="font-medium">{calculation.containerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Konteyner ID</span>
                <span className="font-medium font-mono">{calculation.containerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oluşturulma</span>
                <span className="font-medium">{formatDateTime(calculation.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarih Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Kalkış
                </span>
                <span className="font-medium">{formatDate(calculation.departureDate)}</span>
              </div>
              {calculation.gateInDate && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Gate-in
                  </span>
                  <span className="font-medium">{formatDate(calculation.gateInDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Ardiyesiz Başlangıç
                </span>
                <span className="font-medium text-emerald-600">{formatDate(calculation.freeUntilDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Muafiyet Günü
                </span>
                <span className="font-medium">{calculation.freeDays} gün</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Masraf Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ücretli Gün</p>
                <p className="text-2xl font-bold">{calculation.chargeableDays}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Toplam Masraf</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(calculation.totalCharge)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {calculation.exports.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Dışa Aktarma Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calculation.exports.map((e) => {
                  const visual = statusVisuals[e.status] ?? statusVisuals.failed
                  const Icon = visual.icon
                  const TypeIcon = e.type === "PDF" ? FileDown : Mail
                  return (
                    <div key={e.id} className="flex items-center gap-3 text-sm py-2 px-3 rounded bg-gray-50 dark:bg-gray-800/50">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{e.type}</span>
                      {e.recipient && <span className="text-muted-foreground">→ {e.recipient}</span>}
                      <span className={`flex items-center gap-1 ml-auto ${visual.className}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {visual.label}
                      </span>
                      <span className="text-muted-foreground/70 text-xs">{formatDateTime(e.createdAt)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>
      </div>
    </div>
  )
}
