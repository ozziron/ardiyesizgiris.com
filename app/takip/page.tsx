"use client"

import { useState } from "react"
import { AlertCircle, Clock, MapPin, RefreshCw, Search, Ship } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TrackingEvent = {
  status: string
  location?: string | null
  eventTime?: string | null
  vesselName?: string | null
  voyage?: string | null
}

type TrackingResult = {
  containerId: string
  carrierCode?: string | null
  status: string
  location?: string | null
  eta?: string | null
  lastUpdatedAt: string
  events: TrackingEvent[]
  source: string
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-"
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function ContainerTrackingPage() {
  const [containerId, setContainerId] = useState("")
  const [carrierCode, setCarrierCode] = useState("")
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setResult(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/container-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containerId,
          carrierCode: carrierCode || null,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Tracking sorgusu yapılamadı.")
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tracking sorgusu yapılamadı.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pb-12 pt-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Real-time tracking
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Konteyner Takibi
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Konteyner numarası ve isteğe bağlı hat kodu ile dış tracking sağlayıcısından güncel hareket bilgisini alın.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-emerald-600" />
              Tracking sorgusu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
              <div>
                <Label htmlFor="containerId">Konteyner No</Label>
                <Input
                  id="containerId"
                  value={containerId}
                  onChange={(event) => setContainerId(event.target.value.toUpperCase())}
                  placeholder="MSCU1234567"
                />
              </div>
              <div>
                <Label htmlFor="carrierCode">Hat Kodu</Label>
                <Input
                  id="carrierCode"
                  value={carrierCode}
                  onChange={(event) => setCarrierCode(event.target.value.toUpperCase())}
                  placeholder="MSC"
                />
              </div>
              <Button type="button" onClick={handleSubmit} disabled={isLoading || !containerId.trim()} className="gap-2">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Sorgula
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tracking alınamadı</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{result.containerId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Durum</p>
                  <p className="mt-1 text-lg font-semibold">{result.status}</p>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>{result.location || "Lokasyon belirtilmedi"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>Son güncelleme: {formatDateTime(result.lastUpdatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-emerald-600" />
                    <span>ETA: {formatDateTime(result.eta)}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">
                  Kaynak: {result.source}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hareket Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                {result.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sağlayıcı hareket geçmişi döndürmedi.</p>
                ) : (
                  <div className="space-y-4">
                    {result.events.map((event, index) => (
                      <div key={`${event.status}-${event.eventTime}-${index}`} className="border-l-2 border-emerald-500 pl-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-medium">{event.status}</p>
                          <span className="text-sm text-muted-foreground">{formatDateTime(event.eventTime)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.location || "Lokasyon belirtilmedi"}</p>
                        {(event.vesselName || event.voyage) && (
                          <p className="mt-1 text-sm">
                            {[event.vesselName, event.voyage].filter(Boolean).join(" / ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
