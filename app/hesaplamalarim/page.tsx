"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calculator,
  Ship,
  Calendar,
  Clock,
  Plus,
  FileDown,
  Mail,
  CheckCircle2,
  AlertCircle,
  TestTube2,
  Container,
  Search,
  X,
} from "lucide-react"
import Link from "next/link"

type ExportType = "PDF" | "EMAIL"
type ExportStatus = "success" | "failed" | "dry_run" | "not_configured"

interface ExportRecord {
  id: string
  type: ExportType
  recipient: string | null
  status: ExportStatus
  createdAt: string
}

interface CalculationItem {
  id: string
  portName: string
  carrierName: string
  containerId: string
  departureDate: string
  gateInDate: string | null
  freeUntilDate: string
  containerType: string
  totalCharge: string
  chargeableDays: number
  createdAt: string
  exports: {
    pdfCount: number
    emailCount: number
    lastPdfAt: string | null
    lastEmailAt: string | null
    recent: ExportRecord[]
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR")
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })

const statusVisuals: Record<
  ExportStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: "Başarılı",
    className: "text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  dry_run: {
    label: "Test modu",
    className: "text-blue-600 dark:text-blue-400",
    icon: TestTube2,
  },
  not_configured: {
    label: "Servis aktif değil",
    className: "text-amber-700 dark:text-amber-400",
    icon: AlertCircle,
  },
  failed: {
    label: "Başarısız",
    className: "text-red-600 dark:text-red-400",
    icon: AlertCircle,
  },
}

function ExportHistory({ calc }: { calc: CalculationItem }) {
  const { exports } = calc
  const hasAny = exports.recent.length > 0

  if (!hasAny) {
    return (
      <p className="mt-3 text-xs text-muted-foreground italic">
        Bu hesaplama için henüz dışa aktarma yapılmadı.
      </p>
    )
  }

  return (
    <div className="mt-4 border-t pt-3">
      {/* Summary row: total counts + last export timestamps */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
        <span className="font-medium text-foreground">Dışa Aktarma Geçmişi</span>
        {exports.pdfCount > 0 && (
          <span className="flex items-center gap-1">
            <FileDown className="h-3 w-3 text-emerald-600" />
            {exports.pdfCount} PDF
            {exports.lastPdfAt && (
              <span className="text-muted-foreground/70">· {formatDate(exports.lastPdfAt)}</span>
            )}
          </span>
        )}
        {exports.emailCount > 0 && (
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-emerald-600" />
            {exports.emailCount} Email
            {exports.lastEmailAt && (
              <span className="text-muted-foreground/70">· {formatDate(exports.lastEmailAt)}</span>
            )}
          </span>
        )}
      </div>

      {/* Recent timeline (max 5 events) */}
      <div className="space-y-1">
        {exports.recent.map((e) => {
          const visual = statusVisuals[e.status] ?? statusVisuals.failed
          const Icon = visual.icon
          const TypeIcon = e.type === "PDF" ? FileDown : Mail
          return (
            <div
              key={e.id}
              className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-gray-50 dark:bg-gray-800/50"
            >
              <TypeIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="font-medium">{e.type}</span>
              {e.recipient && (
                <span className="text-muted-foreground truncate">→ {e.recipient}</span>
              )}
              <span className={`flex items-center gap-1 ml-auto ${visual.className}`}>
                <Icon className="h-3 w-3" />
                {visual.label}
              </span>
              <span className="text-muted-foreground/70 flex-shrink-0">
                {formatDateTime(e.createdAt)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HesaplamalarimPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [calculations, setCalculations] = useState<CalculationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [containerSearchInput, setContainerSearchInput] = useState("")
  const [containerSearch, setContainerSearch] = useState("")

  const filteredCostCalculations = useMemo(() => {
    const query = containerSearch.trim().toLocaleUpperCase("tr-TR")
    if (!query) return calculations

    return calculations.filter((calc) =>
      calc.containerId.toLocaleUpperCase("tr-TR").includes(query)
    )
  }, [containerSearch, calculations])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris?callbackUrl=/hesaplamalarim")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCalculations()
    }
  }, [session])

  async function fetchCalculations() {
    try {
      const res = await fetch("/api/users/calculations")
      if (res.ok) {
        const data = await res.json()
        setCalculations(data.data || [])
      }
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  const handleContainerSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContainerSearch(containerSearchInput.trim())
  }

  const clearContainerSearch = () => {
    setContainerSearchInput("")
    setContainerSearch("")
  }

  const renderEmptyState = (title: string, description: string) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        <Button asChild>
          <Link href="/hesaplama">
            <Calculator className="mr-2 h-4 w-4" />
            Hesaplama Yap
          </Link>
        </Button>
      </CardContent>
    </Card>
  )

  const renderCostCards = () => {
    if (calculations.length === 0) {
      return renderEmptyState(
        "Masraf hesaplama kaydı yok",
        "Gate-in ve konteyner numarasıyla yaptığınız masraf hesaplamaları burada listelenecek."
      )
    }

    return (
      <div className="space-y-4">
        <form onSubmit={handleContainerSearch} className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={containerSearchInput}
              onChange={(event) => setContainerSearchInput(event.target.value)}
              placeholder="Konteyner numarası ile ara"
              className="pl-9 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <Search className="h-4 w-4" />
              Ara
            </Button>
            {containerSearch && (
              <Button type="button" variant="outline" onClick={clearContainerSearch}>
                <X className="h-4 w-4" />
                Temizle
              </Button>
            )}
          </div>
        </form>

        {filteredCostCalculations.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium">Aramanızla eşleşen konteyner bulunamadı.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Kopyaladığınız konteyner numarasını kontrol edip tekrar deneyin.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCostCalculations.map((calc) => (
            <Link key={calc.id} href={`/hesaplamalarim/${calc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <Container className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold font-mono">{calc.containerId}</p>
                          <Badge variant="secondary" className="text-xs">
                            {calc.containerType}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {calc.portName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {calc.carrierName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Gate-in: {calc.gateInDate ? formatDate(calc.gateInDate) : "-"}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <Clock className="h-3 w-3" />
                            Ücretli gün: {calc.chargeableDays}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
                      {formatDate(calc.createdAt)}
                    </p>
                  </div>

                  <ExportHistory calc={calc} />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hesaplamalarım</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gate-in ve konteyner numarasıyla yaptığınız masraf hesaplamaları
            </p>
          </div>
          <Button asChild>
            <Link href="/hesaplama">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Hesaplama
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : calculations.length === 0 ? (
          /* Empty state */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Calculator className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Henüz masraf hesaplaması yapmadınız</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Kayıt oluşması için gate-in tarihi ve konteyner numarasıyla masraf hesaplaması yapın.
              </p>
              <Button asChild>
                <Link href="/hesaplama">
                  <Calculator className="mr-2 h-4 w-4" />
                  İlk Hesaplamayı Yap
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          renderCostCards()
        )}
      </div>
    </div>
  )
}
