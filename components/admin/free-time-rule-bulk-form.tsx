"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { CONTAINER_TYPE_OPTIONS } from "@/lib/constants/container-types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface PortOption {
  id: string
  name: string
  code?: string
  city?: string | null
}

interface CarrierOption {
  id: string
  name: string
}

type Outcome = {
  portId: string
  portName: string
  containerType: string
  status: "created" | "skipped" | "failed"
  reason?: string
}

const ALL_CITIES_VALUE = "__ALL__"

/**
 * Bulk free-time rule creation form.
 *
 * Replaces the "fill 9 separate forms for one city" tedium by letting an
 * admin pick (in a single submission):
 *   1. One carrier
 *   2. Optional city filter, then multiple ports under that city
 *   3. Multiple container types
 *   4. Shared freeDays / dates / notes
 *
 * The backend (POST /api/admin/free-time-rules/bulk) computes the
 * cartesian product (ports × containerTypes) and returns per-cell
 * outcomes so duplicates are surfaced without aborting the rest.
 */
export function FreeTimeRuleBulkForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [ports, setPorts] = useState<PortOption[]>([])
  const [carriers, setCarriers] = useState<CarrierOption[]>([])
  const [loading, setLoading] = useState(true)

  // Form state — multi-selects use Sets for O(1) toggle.
  const [shippingCompanyId, setShippingCompanyId] = useState("")
  const [cityFilter, setCityFilter] = useState<string>(ALL_CITIES_VALUE)
  const [selectedPortIds, setSelectedPortIds] = useState<Set<string>>(new Set())
  const [selectedContainerTypes, setSelectedContainerTypes] = useState<Set<string>>(new Set())
  const [freeDays, setFreeDays] = useState<number>(7)
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [effectiveUntil, setEffectiveUntil] = useState<string>("")
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [resultOutcomes, setResultOutcomes] = useState<Outcome[] | null>(null)
  const [resultSummary, setResultSummary] = useState<{
    created: number
    skipped: number
    failed: number
    total: number
  } | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [pRes, cRes] = await Promise.all([fetch("/api/ports"), fetch("/api/carriers")])
        const [pData, cData] = await Promise.all([pRes.json(), cRes.json()])
        setPorts(pData.data || [])
        setCarriers(cData.data || [])
      } catch {
        toast({
          title: "Hata",
          description: "Form seçenekleri yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [toast])

  // Distinct cities found across ports, sorted. Add a sentinel "all cities"
  // option at the top so the user can disable the filter.
  const cities = useMemo(() => {
    const set = new Set<string>()
    for (const p of ports) {
      if (p.city) set.add(p.city)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"))
  }, [ports])

  // Ports visible in the multi-select list, respecting city filter.
  const visiblePorts = useMemo(() => {
    if (cityFilter === ALL_CITIES_VALUE) return ports
    return ports.filter((p) => p.city === cityFilter)
  }, [ports, cityFilter])

  const togglePort = (id: string) => {
    setSelectedPortIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleType = (value: string) => {
    setSelectedContainerTypes((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  // Quick actions restricted to visiblePorts so "Hepsini Seç" with a city
  // filter only toggles that city's ports.
  const selectAllVisiblePorts = () => {
    setSelectedPortIds((prev) => {
      const next = new Set(prev)
      visiblePorts.forEach((p) => next.add(p.id))
      return next
    })
  }
  const clearAllVisiblePorts = () => {
    setSelectedPortIds((prev) => {
      const next = new Set(prev)
      visiblePorts.forEach((p) => next.delete(p.id))
      return next
    })
  }

  const totalCombinations = selectedPortIds.size * selectedContainerTypes.size

  const validate = (): string | null => {
    if (!shippingCompanyId) return "Hat seçilmeli"
    if (selectedPortIds.size === 0) return "En az 1 liman seçilmeli"
    if (selectedContainerTypes.size === 0) return "En az 1 ekipman tipi seçilmeli"
    if (!freeDays || freeDays < 1) return "Muafiyet günü en az 1 olmalı"
    if (!effectiveFrom) return "Başlangıç tarihi gerekli"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResultOutcomes(null)
    setResultSummary(null)

    const error = validate()
    if (error) {
      toast({ title: "Eksik bilgi", description: error, variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/free-time-rules/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portIds: Array.from(selectedPortIds),
          shippingCompanyId,
          containerTypes: Array.from(selectedContainerTypes),
          freeDays,
          effectiveFrom,
          effectiveUntil: effectiveUntil || null,
          isActive,
          notes: notes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Kayıt sırasında hata oluştu")
      }

      setResultOutcomes(data.outcomes || [])
      setResultSummary(data.summary || null)

      const summary = data.summary
      if (summary?.created > 0) {
        toast({
          title: "Başarılı",
          description: `${summary.created} yeni kural eklendi${
            summary.skipped > 0 ? `, ${summary.skipped} tanesi zaten mevcuttu` : ""
          }.`,
        })
      } else if (summary?.skipped > 0) {
        toast({
          title: "Bilgi",
          description: `${summary.skipped} kural zaten mevcuttu, hiç yeni kayıt eklenmedi.`,
        })
      }
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Kayıt sırasında hata oluştu",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/muafiyet-kurallari")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Yeni Muafiyet Kuralı (Toplu)
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Tek seferde birden fazla liman ve ekipman tipi için aynı muafiyet kuralını oluşturun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Carrier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Hat</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={shippingCompanyId} onValueChange={setShippingCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Bir hat seçin" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Step 2: Ports (city filter + multi-select) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>2. Limanlar</span>
              <Badge variant="secondary">{selectedPortIds.size} seçili</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[200px_1fr] sm:items-center">
              <Label className="text-sm font-medium">Şehir filtresi</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm şehirler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CITIES_VALUE}>Tüm şehirler</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllVisiblePorts}
                disabled={visiblePorts.length === 0}
              >
                Görünenlerin Hepsini Seç
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllVisiblePorts}
                disabled={visiblePorts.length === 0}
              >
                Görünenleri Temizle
              </Button>
            </div>

            {visiblePorts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-muted-foreground dark:border-slate-700">
                Bu şehirde liman bulunamadı. Önce{" "}
                <a href="/admin/limanlar/yeni" className="text-emerald-600 underline">
                  liman ekleyin
                </a>
                .
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {visiblePorts.map((port) => {
                  const checked = selectedPortIds.has(port.id)
                  return (
                    <label
                      key={port.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                        checked
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => togglePort(port.id)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{port.name}</p>
                        {port.city && (
                          <p className="truncate text-xs text-muted-foreground">{port.city}</p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Container types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>3. Ekipman Tipleri</span>
              <Badge variant="secondary">{selectedContainerTypes.size} seçili</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {CONTAINER_TYPE_OPTIONS.map((opt) => {
                const checked = selectedContainerTypes.has(opt.value)
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      checked
                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleType(opt.value)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs font-mono text-muted-foreground">{opt.value}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Shared rule values */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Muafiyet Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Muafiyet Günü *</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={freeDays}
                  onChange={(e) => setFreeDays(parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div className="space-y-2">
                <Label>Başlangıç Tarihi *</Label>
                <Input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bitiş Tarihi (opsiyonel)</Label>
                <Input
                  type="date"
                  value={effectiveUntil}
                  onChange={(e) => setEffectiveUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notlar</Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Operasyon notu, kontrat referansı vb."
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <Label className="text-sm font-medium">Aktif</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pasif kayıtlar hesaplamada dikkate alınmaz.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        {/* Summary banner — what will be created */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="text-sm">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {totalCombinations}
            </span>{" "}
            <span className="text-slate-600 dark:text-slate-300">
              kural oluşturulacak ({selectedPortIds.size} liman × {selectedContainerTypes.size}{" "}
              ekipman). Daha önce aynı başlangıç tarihiyle eklenmiş kombinasyonlar atlanır.
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting || totalCombinations === 0}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Toplu Kayıt Oluştur
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/muafiyet-kurallari")}
          >
            İptal
          </Button>
        </div>
      </form>

      {/* Per-cell outcome detail after submit */}
      {resultSummary && resultOutcomes && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Sonuç Detayları</span>
              <div className="flex gap-2">
                {resultSummary.created > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {resultSummary.created} eklendi
                  </Badge>
                )}
                {resultSummary.skipped > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    {resultSummary.skipped} mevcut
                  </Badge>
                )}
                {resultSummary.failed > 0 && (
                  <Badge variant="destructive">{resultSummary.failed} hata</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {resultOutcomes.map((o, idx) => (
                <div
                  key={`${o.portId}-${o.containerType}-${idx}`}
                  className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/40"
                >
                  {o.status === "created" ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle
                      className={`h-4 w-4 flex-shrink-0 ${
                        o.status === "skipped" ? "text-amber-600" : "text-red-600"
                      }`}
                    />
                  )}
                  <span className="font-medium">{o.portName}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono text-xs">{o.containerType}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {o.status === "created"
                      ? "Eklendi"
                      : o.status === "skipped"
                        ? o.reason || "Mevcut"
                        : o.reason || "Hata"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => router.push("/admin/muafiyet-kurallari")}
                variant="default"
              >
                Listeye Dön
              </Button>
              <Button
                onClick={() => {
                  setResultOutcomes(null)
                  setResultSummary(null)
                  setSelectedPortIds(new Set())
                  setSelectedContainerTypes(new Set())
                }}
                variant="outline"
              >
                Yeni Toplu Kayıt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
